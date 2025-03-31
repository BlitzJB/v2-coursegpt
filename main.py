#!/usr/bin/env python3
"""
Course Generation Pipeline

This script implements a complete pipeline for generating course content using the Perplexity API.
The process follows these steps:
1. Generate a course outline in JSON format
2. Enhance subunit descriptions
3. Generate detailed content for each subunit
4. Save all content as markdown files with frontmatter in an organized folder structure

Features:
- Intelligent rate limit handling for Perplexity API
- Parallel processing for content generation
- Comprehensive progress tracking
- Error handling and retries
- Organized folder structure for generated content with metadata frontmatter
"""

import os
import json
import time
import logging
import asyncio
import aiohttp
import aiofiles
import concurrent.futures
import argparse
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple, Union
import re
import random
from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("course_generation.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("course_generator")

# Constants
PROMPTS_DIR = "prompts"
OUTPUT_DIR = "output"
MAX_RETRIES = 5
RETRY_DELAY_BASE = 2  # Base delay in seconds for exponential backoff
PARALLEL_REQUESTS = 3  # Number of parallel content generation requests
API_KEY_ENV_VAR = "PERPLEXITY_API_KEY"
API_ENDPOINT = "https://api.perplexity.ai/chat/completions"

# Rate limit tracking
class RateLimitTracker:
    def __init__(self):
        self.requests_limit = 100  # Default values, will be updated from headers
        self.tokens_limit = 10000
        self.requests_remaining = 100
        self.tokens_remaining = 10000
        self.requests_reset_time = None
        self.tokens_reset_time = None
        self.last_updated = datetime.now()
    
    def update_from_headers(self, headers: Dict[str, str]) -> None:
        """Update rate limit information from API response headers"""
        try:
            # Update limits if headers are present
            if 'x-ratelimit-limit-requests' in headers:
                self.requests_limit = int(headers['x-ratelimit-limit-requests'])
            if 'x-ratelimit-limit-tokens' in headers:
                self.tokens_limit = int(headers['x-ratelimit-limit-tokens'])
            if 'x-ratelimit-remaining-requests' in headers:
                self.requests_remaining = int(headers['x-ratelimit-remaining-requests'])
            if 'x-ratelimit-remaining-tokens' in headers:
                self.tokens_remaining = int(headers['x-ratelimit-remaining-tokens'])
            
            # Update reset times
            now = datetime.now()
            if 'x-ratelimit-reset-requests' in headers:
                reset_seconds = int(headers['x-ratelimit-reset-requests'])
                self.requests_reset_time = now + timedelta(seconds=reset_seconds)
            if 'x-ratelimit-reset-tokens' in headers:
                reset_seconds = int(headers['x-ratelimit-reset-tokens'])
                self.tokens_reset_time = now + timedelta(seconds=reset_seconds)
            
            self.last_updated = now
            logger.debug(f"Rate limits updated: {self.requests_remaining}/{self.requests_limit} requests, "
                         f"{self.tokens_remaining}/{self.tokens_limit} tokens")
        except (ValueError, KeyError) as e:
            logger.warning(f"Error parsing rate limit headers: {e}")
    
    async def wait_if_needed(self) -> None:
        """Wait if we're close to rate limits"""
        now = datetime.now()
        
        # Default thresholds - be conservative
        request_threshold = max(1, int(self.requests_limit * 0.1))  # 10% of limit or at least 1
        token_threshold = max(100, int(self.tokens_limit * 0.1))    # 10% of limit or at least 100
        
        # Check if we need to wait for requests limit
        if self.requests_remaining <= request_threshold and self.requests_reset_time:
            wait_time = (self.requests_reset_time - now).total_seconds()
            if wait_time > 0:
                logger.info(f"Approaching request rate limit. Waiting {wait_time:.1f} seconds.")
                await asyncio.sleep(wait_time + 1)  # Add 1 second buffer
        
        # Check if we need to wait for tokens limit
        if self.tokens_remaining <= token_threshold and self.tokens_reset_time:
            wait_time = (self.tokens_reset_time - now).total_seconds()
            if wait_time > 0:
                logger.info(f"Approaching token rate limit. Waiting {wait_time:.1f} seconds.")
                await asyncio.sleep(wait_time + 1)  # Add 1 second buffer

# Progress tracking
class ProgressTracker:
    def __init__(self, course_title: str):
        self.start_time = datetime.now()
        self.course_title = course_title
        self.status = "initializing"
        self.outline_status = "pending"
        self.description_status = "pending"
        self.content_status = {}  # Map of subunit_id -> status
        self.errors = {}  # Map of component -> error details
        self.completed_count = 0
        self.total_count = 0
        self.logs = []
        
    def log(self, level: str, message: str, component: str = "general", details: Any = None) -> None:
        """Add an entry to the log with timestamp"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "message": message,
            "component": component,
            "details": details
        }
        self.logs.append(log_entry)
        # Also log to standard logger
        if level == "info":
            logger.info(f"[{component}] {message}")
        elif level == "warning":
            logger.warning(f"[{component}] {message}")
        elif level == "error":
            logger.error(f"[{component}] {message}")
        elif level == "success":
            logger.info(f"[{component}] {message}")
    
    def set_outline_complete(self, units_count: int) -> None:
        """Mark the outline generation as complete and update total count"""
        self.outline_status = "complete"
        self.status = "enhancing-descriptions"
        self.log("success", f"Outline generated with {units_count} units", "outline")
    
    def set_descriptions_complete(self, subunit_count: int) -> None:
        """Mark the description enhancement as complete and initialize content tracking"""
        self.description_status = "complete"
        self.status = "generating-content"
        self.total_count = subunit_count
        self.content_status = {i: "pending" for i in range(1, subunit_count + 1)}
        self.log("success", f"Descriptions enhanced for {subunit_count} subunits", "descriptions")
    
    def start_subunit_content(self, subunit_id: str) -> None:
        """Mark a subunit as in-progress for content generation"""
        self.content_status[subunit_id] = "in-progress"
        self.log("info", f"Starting content generation", f"subunit-{subunit_id}")
    
    def complete_subunit_content(self, subunit_id: str) -> None:
        """Mark a subunit as complete for content generation"""
        self.content_status[subunit_id] = "complete"
        self.completed_count += 1
        progress = (self.completed_count / self.total_count) * 100 if self.total_count > 0 else 0
        self.log("success", f"Content generation complete. Overall progress: {progress:.1f}%", f"subunit-{subunit_id}")
        
        if self.completed_count == self.total_count:
            self.status = "complete"
            duration = (datetime.now() - self.start_time).total_seconds() / 60
            self.log("success", f"All content generated in {duration:.1f} minutes", "pipeline")
    
    def error_in_subunit(self, subunit_id: str, error: str) -> None:
        """Record an error in a subunit"""
        self.content_status[subunit_id] = "error"
        self.errors[f"subunit-{subunit_id}"] = error
        self.log("error", f"Error during content generation: {error}", f"subunit-{subunit_id}")
    
    def get_summary(self) -> Dict[str, Any]:
        """Get a summary of the current progress"""
        duration = (datetime.now() - self.start_time).total_seconds() / 60
        return {
            "course_title": self.course_title,
            "status": self.status,
            "start_time": self.start_time.isoformat(),
            "duration_minutes": duration,
            "outline_status": self.outline_status,
            "description_status": self.description_status,
            "completed_subunits": self.completed_count,
            "total_subunits": self.total_count,
            "progress_percentage": (self.completed_count / self.total_count * 100) if self.total_count > 0 else 0,
            "error_count": len(self.errors)
        }
    
    def save_progress(self, filepath: str) -> None:
        """Save progress data to a file"""
        with open(filepath, 'w') as f:
            json.dump({
                "summary": self.get_summary(),
                "content_status": self.content_status,
                "errors": self.errors,
                "logs": self.logs
            }, f, indent=2)

# API Client for Perplexity
class PerplexityClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.rate_tracker = RateLimitTracker()
        self.session = None
    
    async def ensure_session(self):
        """Ensure we have an active aiohttp session"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
        return self.session
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def send_request(self, prompt: str, model: str = "sonar", 
                        temperature: float = 0.7, max_tokens: int = 4000) -> Dict[str, Any]:
        """
        Send a request to the Perplexity API with rate limit handling and retries
        
        Args:
            prompt: The prompt text to send
            model: The model to use
            temperature: Temperature setting (0.0 to 1.0)
            max_tokens: Maximum tokens in the response
            
        Returns:
            The API response as a dictionary
        """
        session = await self.ensure_session()
        
        # Prepare the API request payload
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Check rate limits before making request
        await self.rate_tracker.wait_if_needed()
        
        # Attempt the request with retries
        retry_count = 0
        while retry_count <= MAX_RETRIES:
            try:
                async with session.post(API_ENDPOINT, json=payload, headers=headers) as response:
                    # Update rate limits from response headers
                    self.rate_tracker.update_from_headers(response.headers)
                    
                    if response.status == 200:
                        # Success case
                        return await response.json()
                    elif response.status == 429:
                        # Rate limit exceeded
                        reset_time = response.headers.get('x-ratelimit-reset-requests', 60)
                        try:
                            wait_time = int(reset_time) + random.randint(1, 5)  # Add some jitter
                        except ValueError:
                            wait_time = 60  # Default to 60 seconds if we can't parse
                        
                        logger.warning(f"Rate limit exceeded. Waiting {wait_time} seconds before retry.")
                        await asyncio.sleep(wait_time)
                        retry_count += 1
                    elif response.status >= 500:
                        # Server error, retry
                        wait_time = RETRY_DELAY_BASE ** retry_count + random.random()
                        logger.warning(f"Server error (status {response.status}). Retry {retry_count+1}/{MAX_RETRIES} after {wait_time:.1f}s")
                        await asyncio.sleep(wait_time)
                        retry_count += 1
                    else:
                        # Client error or other issues
                        error_text = await response.text()
                        raise Exception(f"API request failed with status {response.status}: {error_text}")
            
            except aiohttp.ClientError as e:
                wait_time = RETRY_DELAY_BASE ** retry_count + random.random()
                logger.warning(f"Network error: {e}. Retry {retry_count+1}/{MAX_RETRIES} after {wait_time:.1f}s")
                await asyncio.sleep(wait_time)
                retry_count += 1
                
                # Recreate session if connection issues
                if retry_count % 2 == 0:
                    await self.close()
                    self.session = None
                    await self.ensure_session()
                    
            except Exception as e:
                # Unexpected error
                logger.error(f"Unexpected error: {e}")
                raise
        
        # If we've exhausted retries
        raise Exception(f"Failed after {MAX_RETRIES} retries")
    
    async def extract_content(self, response: Dict[str, Any]) -> str:
        """Extract the content from a Perplexity API response"""
        try:
            return response['choices'][0]['message']['content']
        except (KeyError, IndexError):
            logger.error(f"Unexpected API response format: {json.dumps(response)[:200]}...")
            raise ValueError("Invalid API response format")

# File Utilities
class FileUtils:
    @staticmethod
    async def read_prompt(prompt_name: str) -> str:
        """Read a prompt file from the prompts directory"""
        prompt_path = os.path.join(PROMPTS_DIR, f"{prompt_name}.md")
        async with aiofiles.open(prompt_path, 'r') as f:
            return await f.read()
    
    @staticmethod
    async def save_json(data: Any, filename: str, course_folder: Optional[str] = None) -> str:
        """Save data as JSON to the output directory"""
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        # If course folder is provided, save inside that folder
        if course_folder:
            target_dir = os.path.join(OUTPUT_DIR, course_folder)
            os.makedirs(target_dir, exist_ok=True)
            filepath = os.path.join(target_dir, filename)
        else:
            filepath = os.path.join(OUTPUT_DIR, filename)
            
        async with aiofiles.open(filepath, 'w') as f:
            await f.write(json.dumps(data, indent=2))
        return filepath
    
    @staticmethod
    async def save_markdown(content: str, unit_info: Dict[str, Any], subunit_info: Dict[str, Any], 
                          course_info: Dict[str, Any], course_folder: str) -> str:
        """Save content as Markdown to the output directory with frontmatter in organized folders"""
        # Create main course folder
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        course_dir = os.path.join(OUTPUT_DIR, course_folder)
        os.makedirs(course_dir, exist_ok=True)
        
        # Create unit folder
        unit_number = unit_info.get("unit_number", "unknown")
        unit_title = FileUtils.sanitize_filename(unit_info.get("unit_title", f"Unit-{unit_number}"))
        unit_folder = f"unit{unit_number}-{unit_title}"
        unit_dir = os.path.join(course_dir, unit_folder)
        os.makedirs(unit_dir, exist_ok=True)
        
        # Create file name for subunit
        subunit_number = subunit_info.get("subunit_number", "unknown")
        subunit_title = FileUtils.sanitize_filename(subunit_info.get("subunit_title", f"Subunit-{subunit_number}"))
        filename = f"subunit{subunit_number}-{subunit_title}.md"
        
        filepath = os.path.join(unit_dir, filename)
        
        # Create frontmatter with metadata
        frontmatter = {
            "title": subunit_info.get("subunit_title", ""),
            "unit": unit_info.get("unit_title", ""),
            "unit_number": unit_info.get("unit_number", ""),
            "subunit_number": subunit_number,
            "course": course_info.get("title", ""),
            "difficulty_level": course_info.get("difficulty_level", ""),
            "learning_objectives": subunit_info.get("learning_objectives", []),
            "key_topics": subunit_info.get("key_topics", [])
        }
        
        # Format frontmatter as YAML
        yaml_frontmatter = "---\n"
        for key, value in frontmatter.items():
            if isinstance(value, list):
                yaml_frontmatter += f"{key}:\n"
                for item in value:
                    yaml_frontmatter += f"  - \"{item}\"\n"
            else:
                yaml_frontmatter += f"{key}: \"{value}\"\n"
        yaml_frontmatter += "---\n\n"
        
        # Combine frontmatter with content
        full_content = yaml_frontmatter + content
        
        async with aiofiles.open(filepath, 'w') as f:
            await f.write(full_content)
        return filepath
    
    @staticmethod
    def sanitize_filename(text: str) -> str:
        """Convert text to a valid filename"""
        # Replace spaces and special chars with underscores
        sanitized = re.sub(r'[^\w\-\.]', '_', text)
        # Ensure no double underscores
        sanitized = re.sub(r'__+', '_', sanitized)
        # Truncate if too long
        if len(sanitized) > 50:
            sanitized = sanitized[:50]
        return sanitized
    
    @staticmethod
    def create_course_folder(course_title: str) -> str:
        """Create a unique course folder based on title and timestamp"""
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        safe_title = FileUtils.sanitize_filename(course_title)
        folder_name = f"{safe_title}-{timestamp}"
        return folder_name

# Main Pipeline Components
class CoursePipeline:
    def __init__(self, api_key: str, course_title: str, course_description: str):
        self.api_client = PerplexityClient(api_key)
        self.course_title = course_title
        self.course_description = course_description
        self.progress = ProgressTracker(course_title)
        self.outline = None
        self.enhanced_descriptions = None
        self.course_folder = None
    
    async def generate_outline(self) -> Dict[str, Any]:
        """Generate the initial course outline"""
        self.progress.log("info", "Starting outline generation", "outline")
        
        # Read the outline generation prompt
        prompt_template = await FileUtils.read_prompt("course-outline-prompt")
        
        # Fill in the course information
        prompt = prompt_template.replace("[COURSE_TITLE]", self.course_title)
        prompt = prompt.replace("[COURSE_DESCRIPTION]", self.course_description)
        
        # Send the request to the API
        response = await self.api_client.send_request(
            prompt=prompt, 
            temperature=0.7,
            max_tokens=4000
        )
        
        # Extract and parse the JSON response
        content = await self.api_client.extract_content(response)
        
        # Extract JSON from the response (it might be wrapped in markdown code blocks)
        json_content = self._extract_json(content)
        
        try:
            outline = json.loads(json_content)
            
            # Create course folder
            self.course_folder = FileUtils.create_course_folder(outline.get("course", {}).get("title", self.course_title))
            
            # Save the outline to a file
            filepath = await FileUtils.save_json(outline, "course_outline.json", self.course_folder)
            self.progress.log("info", f"Outline saved to {filepath}", "outline")
            
            # Count the total number of units
            unit_count = len(outline.get("units", []))
            self.progress.set_outline_complete(unit_count)
            
            return outline
        except json.JSONDecodeError as e:
            self.progress.log("error", f"Failed to parse outline JSON: {e}", "outline", json_content[:500])
            raise
    
    async def enhance_descriptions(self, outline: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Enhance the descriptions for each subunit"""
        self.progress.log("info", "Starting description enhancement", "descriptions")
        
        # Read the description enhancement prompt
        prompt_template = await FileUtils.read_prompt("description-enhancement-prompt")
        
        # Prepare the outline JSON for the prompt
        outline_json = json.dumps(outline, indent=2)
        
        # Create the full prompt
        prompt = f"{prompt_template}\n\n## Input\n\n```json\n{outline_json}\n```"
        
        # Send the request to the API
        response = await self.api_client.send_request(
            prompt=prompt, 
            temperature=0.7,
            max_tokens=8000  # Allow for longer response as we need detailed descriptions
        )
        
        # Extract and parse the JSON response
        content = await self.api_client.extract_content(response)
        
        # Extract JSON from the response
        json_content = self._extract_json(content)
        
        try:
            enhanced_descriptions = json.loads(json_content)
            
            # Save the enhanced descriptions to a file
            filepath = await FileUtils.save_json(enhanced_descriptions, "enhanced_descriptions.json", self.course_folder)
            self.progress.log("info", f"Enhanced descriptions saved to {filepath}", "descriptions")
            
            # Count the total number of subunits
            subunit_count = len(enhanced_descriptions)
            self.progress.set_descriptions_complete(subunit_count)
            
            return enhanced_descriptions
        except json.JSONDecodeError as e:
            self.progress.log("error", f"Failed to parse enhanced descriptions JSON: {e}", "descriptions", json_content[:500])
            raise
    
    async def generate_subunit_content(self, outline: Dict[str, Any], enhanced_descriptions: List[Dict[str, Any]],
                                      subunit_info: Dict[str, Any]) -> str:
        """Generate content for a specific subunit"""
        subunit_number = subunit_info["subunit_number"]
        subunit_id = str(subunit_number)
        
        self.progress.start_subunit_content(subunit_id)
        self.progress.log("info", f"Generating content for subunit {subunit_number}", f"subunit-{subunit_id}")
        
        # Find the enhanced description for this subunit
        description = next((desc["subunit_description"] for desc in enhanced_descriptions 
                           if str(desc["subunit_number"]) == str(subunit_number)), None)
        
        if not description:
            error_msg = f"No enhanced description found for subunit {subunit_number}"
            self.progress.error_in_subunit(subunit_id, error_msg)
            raise ValueError(error_msg)
        
        # Find the unit information
        unit_info = None
        for unit in outline.get("units", []):
            for subunit in unit.get("subunits", []):
                if str(subunit.get("subunit_number")) == str(subunit_number):
                    unit_info = unit
                    subunit_info = subunit
                    break
            if unit_info:
                break
        
        if not unit_info:
            error_msg = f"Could not find unit information for subunit {subunit_number}"
            self.progress.error_in_subunit(subunit_id, error_msg)
            raise ValueError(error_msg)
        
        # Read the content generation prompt
        prompt_template = await FileUtils.read_prompt("subunit-content-generation-prompt")
        
        # Create a context object with all the information needed
        context = {
            "course": outline.get("course", {}),
            "unit": {
                "unit_number": unit_info.get("unit_number"),
                "unit_title": unit_info.get("unit_title"),
                "unit_description": unit_info.get("unit_description")
            },
            "subunit": {
                "subunit_number": subunit_number,
                "subunit_title": subunit_info.get("subunit_title"),
                "learning_objectives": subunit_info.get("learning_objectives", []),
                "key_topics": subunit_info.get("key_topics", [])
            },
            "enhanced_description": description
        }
        
        # Create the full prompt
        prompt = f"{prompt_template}\n\n## Input Context\n\n```json\n{json.dumps(context, indent=2)}\n```"
        
        # Send the request to the API - use higher max_tokens for content generation
        response = await self.api_client.send_request(
            prompt=prompt, 
            temperature=0.7,
            max_tokens=12000  # Allow for very detailed content
        )
        
        # Extract the content
        content = await self.api_client.extract_content(response)
        
        # Save the content to a file using the new folder structure and frontmatter
        filepath = await FileUtils.save_markdown(
            content, 
            unit_info, 
            subunit_info,
            outline.get("course", {}),
            self.course_folder
        )
        
        self.progress.log("info", f"Content saved to {filepath}", f"subunit-{subunit_id}")
        
        # Mark as complete
        self.progress.complete_subunit_content(subunit_id)
        
        return content
    
    async def run_pipeline(self) -> None:
        """Run the complete pipeline"""
        try:
            # Step 1: Generate the course outline
            self.outline = await self.generate_outline()
            
            # Step 2: Enhance the descriptions
            self.enhanced_descriptions = await self.enhance_descriptions(self.outline)
            
            # Step 3: Generate content for each subunit in parallel
            await self.generate_all_content()
            
            # Save final progress
            if self.course_folder:
                progress_file = os.path.join(OUTPUT_DIR, self.course_folder, "progress_final.json")
            else:
                progress_file = os.path.join(OUTPUT_DIR, "progress_final.json")
                
            self.progress.save_progress(progress_file)
            
            self.progress.log("success", "Course generation pipeline completed successfully", "pipeline")
        except Exception as e:
            self.progress.log("error", f"Pipeline failed: {str(e)}", "pipeline")
            raise
        finally:
            # Ensure API client is closed
            await self.api_client.close()
    
    async def generate_all_content(self) -> None:
        """Generate content for all subunits using parallel processing"""
        # Collect all subunits from the outline
        all_subunits = []
        for unit in self.outline.get("units", []):
            for subunit in unit.get("subunits", []):
                all_subunits.append(subunit)
        
        # Sort by subunit number to ensure predictable processing order
        all_subunits.sort(key=lambda x: float(x.get("subunit_number", 0)))
        
        # Create a semaphore to limit concurrent requests
        semaphore = asyncio.Semaphore(PARALLEL_REQUESTS)
        
        async def process_with_semaphore(subunit):
            async with semaphore:
                try:
                    return await self.generate_subunit_content(
                        self.outline, 
                        self.enhanced_descriptions,
                        subunit
                    )
                except Exception as e:
                    subunit_id = str(subunit.get("subunit_number", "unknown"))
                    self.progress.error_in_subunit(subunit_id, str(e))
                    logger.error(f"Error generating content for subunit {subunit_id}: {e}")
                    return None
        
        # Create tasks for all subunits
        tasks = [process_with_semaphore(subunit) for subunit in all_subunits]
        
        # Wait for all tasks to complete
        await asyncio.gather(*tasks)
    
    def _extract_json(self, content: str) -> str:
        """Extract JSON from a string that might contain markdown or other text"""
        # Try to extract JSON from code blocks first
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
        if json_match:
            return json_match.group(1).strip()
        
        # If no code blocks, try to find JSON brackets
        json_match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', content)
        if json_match:
            return json_match.group(1).strip()
        
        # If all else fails, return the content as is
        return content.strip()

async def main(course_title: str, course_description: str):
    """Main entry point for the script"""
    # Create necessary directories
    os.makedirs(PROMPTS_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Check if prompt files exist
    prompt_files = [
        "course-outline-prompt.md",
        "description-enhancement-prompt.md",
        "subunit-content-generation-prompt.md"
    ]
    
    missing_files = [f for f in prompt_files if not os.path.exists(os.path.join(PROMPTS_DIR, f))]
    if missing_files:
        logger.error(f"Missing prompt files: {', '.join(missing_files)}")
        logger.error(f"Please ensure all prompt files exist in the {PROMPTS_DIR} directory")
        return
    
    # Get API key from environment
    api_key = os.environ.get(API_KEY_ENV_VAR)
    if not api_key:
        logger.error(f"API key not found. Please set the {API_KEY_ENV_VAR} environment variable.")
        return
    
    # Create and run the pipeline
    pipeline = CoursePipeline(api_key, course_title, course_description)
    
    start_time = time.time()
    logger.info(f"Starting course generation pipeline for '{course_title}'")
    
    try:
        await pipeline.run_pipeline()
        
        # Log completion stats
        duration = (time.time() - start_time) / 60
        logger.info(f"Pipeline completed in {duration:.1f} minutes")
    except Exception as e:
        logger.error(f"Pipeline failed: {e}")
        # Save progress even on failure
        pipeline.progress.save_progress(os.path.join(OUTPUT_DIR, "progress_error.json"))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate a course using the Perplexity API")
    parser.add_argument("--title", required=True, help="The title of the course")
    parser.add_argument("--description", required=True, help="Description of the course")
    
    args = parser.parse_args()
    
    # Run the async main function
    asyncio.run(main(args.title, args.description))