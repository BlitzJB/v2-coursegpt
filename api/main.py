#!/usr/bin/env python3
"""
CourseGPT API

A FastAPI server that provides endpoints to read course data from the folder structure
created by the CourseGPT generator.

This API serves as the backend for the CourseGPT frontend application.
"""

import os
import re
import json
import yaml
import sys
import asyncio
import threading
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv, find_dotenv

# Load environment variables
load_dotenv(find_dotenv())


try:
    from genai import (
        CoursePipeline, 
        PROMPTS_DIR, 
        OUTPUT_DIR, 
        API_KEY_ENV_VAR, 
        main as generate_course
    )
    pipeline_available = True
except ImportError as e:
    print(f"Could not import course generation pipeline from main.py: {e}")
    PROMPTS_DIR = "prompts"
    OUTPUT_DIR = "output"
    API_KEY_ENV_VAR = "PERPLEXITY_API_KEY"
    pipeline_available = False
    print("Course generation pipeline not available.")


API_OUTPUT_DIR = OUTPUT_DIR

app = FastAPI(
    title="CourseGPT API",
    description="API for accessing CourseGPT course content",
    version="1.0.0",
)

# Add CORS middleware to allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Add POST method for course creation
    allow_headers=["*"],
)

# Pydantic models for type validation and documentation
class LearningObjective(BaseModel):
    text: str

class KeyTopic(BaseModel):
    text: str

class Course(BaseModel):
    title: str
    description: str
    difficulty_level: Optional[str] = None
    estimated_duration: Optional[str] = None
    folder: str
    timestamp: Optional[str] = None
    complete: bool
    in_progress: bool
    initializing: Optional[bool] = None
    progress_percentage: Optional[float] = None

class Unit(BaseModel):
    unit_number: int
    unit_title: str
    unit_description: Optional[str] = None
    folder: str

class Subunit(BaseModel):
    subunit_title: str
    subunit_number: float
    file: str
    learning_objectives: Optional[List[str]] = None
    key_topics: Optional[List[str]] = None

class Frontmatter(BaseModel):
    title: str
    unit: str
    unit_number: str
    subunit_number: float
    course: str
    difficulty_level: Optional[str] = None
    learning_objectives: Optional[List[str]] = None
    key_topics: Optional[List[str]] = None

class CourseContent(BaseModel):
    frontmatter: Frontmatter
    content: str

# Add a new Pydantic model for course creation request
class CourseCreateRequest(BaseModel):
    title: str
    description: str

# Helper functions
def extract_timestamp_from_folder(folder_name: str) -> Optional[str]:
    """Extract timestamp from folder name in the format YYYYMMDD-HHMMSS"""
    timestamp_match = re.search(r'(\d{8}-\d{6})', folder_name)
    if timestamp_match:
        timestamp_str = timestamp_match.group(1)
        try:
            timestamp = datetime.strptime(timestamp_str, "%Y%m%d-%H%M%S")
            return timestamp.isoformat()
        except ValueError:
            return None
    return None

def is_course_complete(course_folder: str) -> bool:
    """Check if a course is complete by looking for progress_final.json"""
    progress_final_path = os.path.join(API_OUTPUT_DIR, course_folder, "progress_final.json")
    return os.path.exists(progress_final_path)

def is_course_in_progress(course_folder: str) -> bool:
    """Check if a course is in progress"""
    # First check if there's a progress.json file
    progress_path = os.path.join(API_OUTPUT_DIR, course_folder, "progress.json")
    if os.path.exists(progress_path):
        return True
    
    # If no progress.json, check if there's an outline but not marked as complete
    outline_path = os.path.join(API_OUTPUT_DIR, course_folder, "course_outline.json")
    return os.path.exists(outline_path) and not is_course_complete(course_folder)

def get_course_info(course_folder: str) -> Dict[str, Any]:
    """Get course information from course_outline.json or progress.json"""
    outline_path = os.path.join(API_OUTPUT_DIR, course_folder, "course_outline.json")
    progress_path = os.path.join(API_OUTPUT_DIR, course_folder, "progress.json")
    
    # Initialize default course info
    course_info = {
        "title": course_folder,
        "description": "",
        "folder": course_folder,
        "timestamp": extract_timestamp_from_folder(course_folder),
        "complete": is_course_complete(course_folder),
        "in_progress": is_course_in_progress(course_folder),
        "initializing": False
    }
    
    # Try to read course information from course_outline.json
    if os.path.exists(outline_path):
        try:
            with open(outline_path, 'r') as f:
                data = json.load(f)
                if "course" in data:
                    course_info["title"] = data["course"].get("title", course_folder)
                    course_info["description"] = data["course"].get("description", "")
                    course_info["difficulty_level"] = data["course"].get("difficulty_level", "")
                    course_info["estimated_duration"] = data["course"].get("estimated_duration", "")
        except json.JSONDecodeError:
            pass
    
    # If we're still initializing (no outline yet), try to get title from progress.json
    if not os.path.exists(outline_path) and os.path.exists(progress_path):
        try:
            with open(progress_path, 'r') as f:
                progress_data = json.load(f)
                if "summary" in progress_data:
                    summary = progress_data["summary"]
                    if "course_title" in summary:
                        course_info["title"] = summary["course_title"]
                    if "description" in summary:
                        course_info["description"] = summary["description"]
                    
                    # Check status
                    if summary.get("status") == "initializing":
                        course_info["initializing"] = True
                    elif summary.get("status") in ["enhancing-descriptions", "generating-content"]:
                        course_info["in_progress"] = True
                        
                    # Get progress percentage
                    if "progress_percentage" in summary:
                        course_info["progress_percentage"] = summary["progress_percentage"]
        except json.JSONDecodeError:
            pass
    
    return course_info

def parse_markdown_frontmatter(content: str) -> tuple[Dict[str, Any], str]:
    """Parse frontmatter from markdown content"""
    frontmatter = {}
    main_content = content
    
    frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
    if frontmatter_match:
        frontmatter_text = frontmatter_match.group(1)
        main_content = frontmatter_match.group(2)
        try:
            frontmatter = yaml.safe_load(frontmatter_text)
        except yaml.YAMLError:
            pass
            
    return frontmatter, main_content

# Function to run the course generation process in a background thread
def run_course_generation_in_background(title: str, description: str) -> None:
    """Run the course generation process as a background task"""
    # Create an event loop for the background thread
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        # Run the course generation function
        loop.run_until_complete(generate_course(title, description))
    finally:
        loop.close()

# API Endpoints
@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "CourseGPT API is running"}

@app.get("/courses", response_model=List[Course], tags=["Courses"])
async def get_courses():
    """Get list of all courses"""
    courses = []
    
    if not os.path.exists(API_OUTPUT_DIR):
        return courses
        
    for item in os.listdir(API_OUTPUT_DIR):
        item_path = os.path.join(API_OUTPUT_DIR, item)
        if os.path.isdir(item_path):
            course_info = get_course_info(item)
            courses.append(course_info)
    
    # Sort courses by timestamp (newest first) if available
    courses.sort(
        key=lambda x: (x["timestamp"] is None, x["timestamp"] if x["timestamp"] else ""),
        reverse=True
    )
    
    return courses

@app.get("/courses/{course_folder}", response_model=Course, tags=["Courses"])
async def get_course(course_folder: str):
    """Get details for a specific course"""
    course_path = os.path.join(API_OUTPUT_DIR, course_folder)
    
    if not os.path.exists(course_path) or not os.path.isdir(course_path):
        raise HTTPException(status_code=404, detail=f"Course '{course_folder}' not found")
    
    course_info = get_course_info(course_folder)
    return course_info

@app.get("/courses/{course_folder}/units", response_model=List[Unit], tags=["Units"])
async def get_units(course_folder: str):
    """Get all units for a specific course"""
    course_path = os.path.join(API_OUTPUT_DIR, course_folder)
    
    if not os.path.exists(course_path) or not os.path.isdir(course_path):
        raise HTTPException(status_code=404, detail=f"Course '{course_folder}' not found")
    
    units = []
    unit_pattern = re.compile(r'unit(\d+)')
    
    for item in os.listdir(course_path):
        item_path = os.path.join(course_path, item)
        if os.path.isdir(item_path) and item.startswith("unit"):
            # Extract unit number from folder name
            unit_match = unit_pattern.search(item)
            if unit_match:
                unit_number = int(unit_match.group(1))
                unit_title_part = item[len(f"unit{unit_number}-"):].replace("_", " ")
                
                # Get unit description from outline if available
                unit_description = ""
                outline_path = os.path.join(course_path, "course_outline.json")
                if os.path.exists(outline_path):
                    try:
                        with open(outline_path, 'r') as f:
                            data = json.load(f)
                            for unit in data.get("units", []):
                                if unit.get("unit_number") == unit_number:
                                    unit_description = unit.get("unit_description", "")
                                    break
                    except json.JSONDecodeError:
                        pass
                
                units.append({
                    "unit_number": unit_number,
                    "unit_title": unit_title_part,
                    "unit_description": unit_description,
                    "folder": item
                })
    
    # Sort units by number
    units.sort(key=lambda x: x["unit_number"])
    return units

@app.get("/courses/{course_folder}/units/{unit_folder}", response_model=List[Subunit], tags=["Subunits"])
async def get_subunits(course_folder: str, unit_folder: str):
    """Get all subunits for a specific unit"""
    unit_path = os.path.join(API_OUTPUT_DIR, course_folder, unit_folder)
    
    if not os.path.exists(unit_path) or not os.path.isdir(unit_path):
        raise HTTPException(status_code=404, detail=f"Unit '{unit_folder}' not found in course '{course_folder}'")
    
    subunits = []
    
    for item in os.listdir(unit_path):
        item_path = os.path.join(unit_path, item)
        if os.path.isfile(item_path) and item.startswith("subunit") and item.endswith(".md"):
            # Read the file to extract frontmatter
            with open(item_path, 'r') as f:
                content = f.read()
                
            # Parse frontmatter
            frontmatter, _ = parse_markdown_frontmatter(content)
            
            # Create subunit info
            subunit_info = {
                "subunit_title": frontmatter.get("title", item),
                "subunit_number": 0,
                "file": item,
                "learning_objectives": frontmatter.get("learning_objectives", []),
                "key_topics": frontmatter.get("key_topics", [])
            }
            
            # Get subunit number from frontmatter or filename
            if "subunit_number" in frontmatter:
                try:
                    subunit_info["subunit_number"] = float(frontmatter["subunit_number"])
                except ValueError:
                    # Extract from filename as fallback
                    subunit_match = re.search(r'subunit(\d+\.\d+)', item)
                    if subunit_match:
                        subunit_info["subunit_number"] = float(subunit_match.group(1))
            else:
                # Extract from filename
                subunit_match = re.search(r'subunit(\d+\.\d+)', item)
                if subunit_match:
                    subunit_info["subunit_number"] = float(subunit_match.group(1))
            
            subunits.append(subunit_info)
    
    # Sort subunits by number
    subunits.sort(key=lambda x: x["subunit_number"])
    return subunits

@app.get("/courses/{course_folder}/units/{unit_folder}/subunits/{subunit_file}", response_model=CourseContent, tags=["Content"])
async def get_subunit_content(course_folder: str, unit_folder: str, subunit_file: str):
    """Get content for a specific subunit"""
    subunit_path = os.path.join(API_OUTPUT_DIR, course_folder, unit_folder, subunit_file)
    
    if not os.path.exists(subunit_path) or not os.path.isfile(subunit_path):
        raise HTTPException(
            status_code=404, 
            detail=f"Subunit '{subunit_file}' not found in unit '{unit_folder}' of course '{course_folder}'"
        )
    
    # Read subunit content
    with open(subunit_path, 'r') as f:
        content = f.read()
    
    # Parse frontmatter and content
    frontmatter, main_content = parse_markdown_frontmatter(content)
    
    # Create response
    return {
        "frontmatter": frontmatter,
        "content": main_content
    }

# Add POST endpoint for course creation with background task
@app.post("/courses/create", response_model=Course, tags=["Courses"])
async def create_course(request: CourseCreateRequest, background_tasks: BackgroundTasks):
    """Create a new course and start generation in the background"""
    
    # Create a timestamp for the folder name
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    safe_folder_name = re.sub(r'[^\w\-\.]', '_', request.title)
    if len(safe_folder_name) > 50:
        safe_folder_name = safe_folder_name[:50]
    folder_name = f"{safe_folder_name}-{timestamp}"
    
    # Create course folder
    folder_path = os.path.join(API_OUTPUT_DIR, folder_name)
    os.makedirs(folder_path, exist_ok=True)
    
    # Create initial progress.json to show the course as "in progress"
    initial_progress = {
        "summary": {
            "course_title": request.title,
            "status": "initializing",
            "start_time": datetime.now().isoformat(),
            "duration_minutes": 0,
            "outline_status": "pending",
            "description_status": "pending",
            "completed_subunits": 0,
            "total_subunits": 0,
            "progress_percentage": 0,
            "error_count": 0
        },
        "content_status": {},
        "errors": {},
        "logs": [{
            "timestamp": datetime.now().isoformat(),
            "level": "info",
            "message": "Course generation initiated",
            "component": "api",
            "details": None
        }]
    }
    
    with open(os.path.join(folder_path, "progress.json"), 'w') as f:
        json.dump(initial_progress, f, indent=2)
    
    # Check if pipeline is available
    if pipeline_available:
        # Start the course generation in a background thread
        background_tasks.add_task(
            lambda: threading.Thread(
                target=run_course_generation_in_background,
                args=(request.title, request.description)
            ).start()
        )
    else:
        # Log that the pipeline is not available
        print(f"Course generation pipeline is not available. Course '{request.title}' created but content generation skipped.")
    
    # Return the newly created course info
    course_info = {
        "title": request.title,
        "description": request.description,
        "folder": folder_name,
        "timestamp": extract_timestamp_from_folder(folder_name),
        "complete": False,
        "in_progress": True,
        "initializing": True
    }
    
    return course_info

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 