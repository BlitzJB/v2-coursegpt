#!/usr/bin/env python3
"""
CourseGPT Viewer & Creator

A Streamlit application to view and create course content. This app:
1. Scans the output directory for course folders
2. Displays a clean UI to browse course content
3. Renders Markdown with proper LaTeX and code block support
4. Provides an interface to create new courses
"""

import os
import json
import streamlit as st
import re
import sys
import time
import asyncio
from datetime import datetime
import yaml
import subprocess
import logging

# Import the CoursePipeline from main.py
sys.path.append(".")
try:
    from main import PROMPTS_DIR, OUTPUT_DIR, API_KEY_ENV_VAR
except ImportError:
    st.error("Could not import from main.py. Make sure main.py is in the current directory.")
    PROMPTS_DIR = "prompts"
    OUTPUT_DIR = "output"
    API_KEY_ENV_VAR = "PERPLEXITY_API_KEY"


class CourseCreator:
    """Class for creating new courses through Streamlit UI"""
    
    def __init__(self):
        """Initialize the course creator"""
        pass
        
    def check_requirements(self):
        """Check if all requirements for course creation are met"""
        requirements_met = True
        messages = []
        
        # Check if prompt files exist
        prompt_files = [
            "course-outline-prompt.md",
            "description-enhancement-prompt.md",
            "subunit-content-generation-prompt.md"
        ]
        
        os.makedirs(PROMPTS_DIR, exist_ok=True)
        missing_files = [f for f in prompt_files if not os.path.exists(os.path.join(PROMPTS_DIR, f))]
        if missing_files:
            requirements_met = False
            messages.append(f"❌ Missing prompt files: {', '.join(missing_files)}")
            messages.append(f"Please ensure all prompt files exist in the {PROMPTS_DIR} directory")
        else:
            messages.append("✅ All prompt files found")
        
        # Check for API key
        api_key = os.environ.get(API_KEY_ENV_VAR)
        if not api_key:
            requirements_met = False
            messages.append(f"❌ API key not found. Please set the {API_KEY_ENV_VAR} environment variable.")
        else:
            messages.append("✅ API key found")
        
        # Check output directory
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        messages.append(f"✅ Output directory available at {OUTPUT_DIR}")
        
        return requirements_met, messages
    
    def render_creator_ui(self):
        """Render the UI for creating a new course"""
        st.title("Create New Course")
        
        # Check requirements first
        requirements_met, messages = self.check_requirements()
        
        # Display requirement check results
        with st.expander("System Requirements", expanded=not requirements_met):
            for message in messages:
                st.markdown(message)
        
        # Initialize session state for form values if not present
        if "course_title" not in st.session_state:
            st.session_state.course_title = ""
        if "course_description" not in st.session_state:
            st.session_state.course_description = ""
            
        # Course details form
        with st.form("course_creation_form"):
            course_title = st.text_input("Course Title", 
                                         value=st.session_state.course_title,
                                         help="Enter a descriptive title for the course")
            course_description = st.text_area(
                "Course Description (optional)", 
                value=st.session_state.course_description,
                height=150,
                help="Provide a detailed description of the course content, target audience, and learning goals"
            )
            
            # Form submission - disable button only if system requirements aren't met
            submit_button = st.form_submit_button(
                "Generate Course", 
                disabled=not requirements_met,
                help="Start the course generation process" if requirements_met else "Please ensure system requirements are met"
            )
            
            # Only show warning about system requirements
            if submit_button and not requirements_met:
                st.warning("Please fix the system requirements issues before proceeding")
        
        # Handle form submission outside the form
        if submit_button and requirements_met:
            # Update session state with form values
            st.session_state.course_title = course_title
            st.session_state.course_description = course_description
            
            # Use default title if empty
            title_to_use = course_title.strip()
            if not title_to_use:
                title_to_use = "Untitled Course"
                st.session_state.course_title = title_to_use
            
            # If description is empty, use a template based on the title
            description_to_use = course_description.strip()
            if not description_to_use:
                description_to_use = f"A comprehensive course about {title_to_use}. This course covers all the essential topics and provides practical examples to help learners master the subject."
            
            # Start the course generation process in background
            self.start_course_generation(title_to_use, description_to_use)
            
            # Redirect to home page immediately
            st.session_state.view = "viewer"
            st.rerun()
    
    def start_course_generation(self, course_title, course_description):
        """Start course generation in the background using a subprocess"""
        # Sanitize inputs to prevent shell injection
        safe_title = course_title.replace('"', '\\"')
        safe_desc = course_description.replace('"', '\\"')
        
        # Create a timestamp for the folder name
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        safe_folder_name = re.sub(r'[^\w\-\.]', '_', safe_title)
        if len(safe_folder_name) > 50:
            safe_folder_name = safe_folder_name[:50]
        folder_name = f"{safe_folder_name}-{timestamp}"
        
        # Create course folder and initial progress file
        folder_path = os.path.join(OUTPUT_DIR, folder_name)
        os.makedirs(folder_path, exist_ok=True)
        
        # Create initial progress.json to show the course as "in progress"
        initial_progress = {
            "summary": {
                "course_title": course_title,
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
                "component": "streamlit_app",
                "details": None
            }]
        }
        
        with open(os.path.join(folder_path, "progress.json"), 'w') as f:
            json.dump(initial_progress, f, indent=2)
        
        # Determine the correct Python command to use
        python_cmd = "python"
        try:
            # Try to check if we're on Linux/Unix systems where python3 is common
            if os.name == "posix":
                # Check if python3 exists and is executable
                try:
                    python3_check = subprocess.run(
                        ["which", "python3"], 
                        capture_output=True, 
                        text=True, 
                        check=False
                    )
                    if python3_check.returncode == 0:
                        python_cmd = "python3"
                except Exception:
                    # If the above check fails, try the platform module
                    import platform
                    if platform.system() == "Linux":
                        python_cmd = "python3"
        except Exception as e:
            print(f"Error detecting Python command: {e}")
        
        # Build the command to run main.py in the background
        cmd = f'nohup {python_cmd} main.py --title "{safe_title}" --description "{safe_desc}" > course_generation.log 2>&1 &'
        
        # Execute the command
        try:
            subprocess.Popen(cmd, shell=True, start_new_session=True)
            st.session_state.last_generation_started = datetime.now().isoformat()
            print(f"Started course generation: {cmd}")
        except Exception as e:
            print(f"Error starting course generation: {e}")
            # Add the error to the progress file
            initial_progress["errors"]["startup"] = str(e)
            initial_progress["summary"]["status"] = "error"
            with open(os.path.join(folder_path, "progress.json"), 'w') as f:
                json.dump(initial_progress, f, indent=2)


class CourseViewer:
    """Class for viewing course content in a clean Streamlit UI"""
    
    def __init__(self, output_dir="output"):
        """Initialize the course viewer with the output directory"""
        self.output_dir = output_dir
        self.courses = self._scan_courses()
        
    def _scan_courses(self):
        """Scan the output directory for course folders"""
        courses = []
        
        if not os.path.exists(self.output_dir):
            return courses
            
        for item in os.listdir(self.output_dir):
            item_path = os.path.join(self.output_dir, item)
            if os.path.isdir(item_path):
                # Extract timestamp from folder name
                timestamp_match = re.search(r'(\d{8}-\d{6})', item)
                timestamp = None
                if timestamp_match:
                    timestamp_str = timestamp_match.group(1)
                    try:
                        timestamp = datetime.strptime(timestamp_str, "%Y%m%d-%H%M%S")
                    except ValueError:
                        pass
                
                # Initialize default course info
                course_info = {"title": item, "description": "", "timestamp": timestamp}
                
                # Try to read course information from course_outline.json
                outline_path = os.path.join(item_path, "course_outline.json")
                if os.path.exists(outline_path):
                    try:
                        with open(outline_path, 'r') as f:
                            data = json.load(f)
                            if "course" in data:
                                course_info["title"] = data["course"].get("title", item)
                                course_info["description"] = data["course"].get("description", "")
                                course_info["difficulty"] = data["course"].get("difficulty_level", "")
                                course_info["duration"] = data["course"].get("estimated_duration", "")
                    except json.JSONDecodeError:
                        pass
                
                # Check if generation is complete by looking for progress_final.json
                progress_final_path = os.path.join(item_path, "progress_final.json")
                course_info["complete"] = os.path.exists(progress_final_path)
                
                # Check for progress.json for courses that are still initializing
                progress_path = os.path.join(item_path, "progress.json")
                has_progress_file = os.path.exists(progress_path)
                
                # A course is in progress if it has an outline but not complete, OR if it has a progress file
                course_info["in_progress"] = (os.path.exists(outline_path) and not course_info["complete"]) or has_progress_file
                
                # If we only have a progress file but no outline yet, try to get title from progress.json
                if has_progress_file and not os.path.exists(outline_path):
                    try:
                        with open(progress_path, 'r') as f:
                            progress_data = json.load(f)
                            if "summary" in progress_data and "course_title" in progress_data["summary"]:
                                course_info["title"] = progress_data["summary"]["course_title"]
                                course_info["initializing"] = True
                    except json.JSONDecodeError:
                        pass
                
                course_info["folder"] = item
                courses.append(course_info)
                
        # Sort courses by timestamp (newest first) if available
        courses.sort(key=lambda x: (x["timestamp"] is None, x["timestamp"] if x["timestamp"] else datetime.max), reverse=True)
        return courses
        
    def _get_units(self, course_folder):
        """Get all units in a course folder"""
        units = []
        folder_path = os.path.join(self.output_dir, course_folder)
        
        for item in os.listdir(folder_path):
            item_path = os.path.join(folder_path, item)
            if os.path.isdir(item_path) and item.startswith("unit"):
                # Extract unit number from folder name
                unit_match = re.search(r'unit(\d+)', item)
                if unit_match:
                    unit_number = int(unit_match.group(1))
                    unit_title = item[len(f"unit{unit_number}-"):].replace("_", " ")
                    units.append({
                        "number": unit_number,
                        "title": unit_title,
                        "folder": item
                    })
        
        # Sort units by number
        units.sort(key=lambda x: x["number"])
        return units
        
    def _get_subunits(self, course_folder, unit_folder):
        """Get all subunits in a unit folder"""
        subunits = []
        folder_path = os.path.join(self.output_dir, course_folder, unit_folder)
        
        for item in os.listdir(folder_path):
            item_path = os.path.join(folder_path, item)
            if os.path.isfile(item_path) and item.startswith("subunit") and item.endswith(".md"):
                # Extract subunit information from frontmatter
                with open(item_path, 'r') as f:
                    content = f.read()
                    
                # Parse frontmatter
                subunit_info = {"title": item, "number": 0}
                frontmatter_match = re.match(r'^---\n(.*?)\n---\n(.*)', content, re.DOTALL)
                if frontmatter_match:
                    frontmatter_text = frontmatter_match.group(1)
                    main_content = frontmatter_match.group(2)
                    try:
                        frontmatter = yaml.safe_load(frontmatter_text)
                        subunit_info["title"] = frontmatter.get("title", item)
                        subunit_info["number"] = float(frontmatter.get("subunit_number", 0))
                    except (yaml.YAMLError, ValueError):
                        # If parsing fails, extract subunit number from filename
                        subunit_match = re.search(r'subunit(\d+\.\d+)', item)
                        if subunit_match:
                            subunit_info["number"] = float(subunit_match.group(1))
                
                subunit_info["file"] = item
                subunits.append(subunit_info)
        
        # Sort subunits by number
        subunits.sort(key=lambda x: x["number"])
        return subunits
        
    def _read_subunit_content(self, course_folder, unit_folder, subunit_file):
        """Read the content of a subunit file and extract frontmatter"""
        file_path = os.path.join(self.output_dir, course_folder, unit_folder, subunit_file)
        
        with open(file_path, 'r') as f:
            content = f.read()
            
        # Parse frontmatter and content
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
    
    def render_course_list(self):
        """Render the list of available courses"""
        col1, col2 = st.columns([3, 1])
        with col1:
            st.title("CourseGPT Viewer")
        with col2:
            if st.button("➕ Create New Course"):
                st.session_state.view = "creator"
                st.rerun()
        
        if not self.courses:
            st.warning("No courses found in the output directory.")
            return
            
        st.write("### Available Courses")
        
        for i, course in enumerate(self.courses):
            with st.container():
                col1, col2 = st.columns([3, 1])
                with col1:
                    title = course["title"]
                    if course["timestamp"]:
                        title += f" ({course['timestamp'].strftime('%Y-%m-%d')})"
                    
                    # Add status indicators for in-progress courses
                    if course.get("initializing", False):
                        title = f"⏳ {title} (Initializing...)"
                    elif course["in_progress"]:
                        title = f"🔄 {title} (Generating...)"
                    elif not course["complete"]:
                        title = f"⚠️ {title} (Incomplete)"
                    
                    if st.button(f"📚 {title}", key=f"course_{i}", use_container_width=True):
                        st.session_state.selected_course = course["folder"]
                        st.session_state.selected_unit = None
                        st.session_state.selected_subunit = None
                        st.rerun()
                
                with col2:
                    difficulty = course.get("difficulty", "")
                    duration = course.get("duration", "")
                    info = []
                    if difficulty:
                        info.append(difficulty)
                    if duration:
                        info.append(duration)
                    
                    if info:
                        st.caption(" | ".join(info))
                
                if course.get("description"):
                    st.caption(course["description"][:200] + "..." if len(course["description"]) > 200 else course["description"])
                st.divider()
    
    def render_unit_list(self, course_folder):
        """Render the list of units for a course"""
        # Get course title
        course_title = course_folder
        course_complete = True
        for course in self.courses:
            if course["folder"] == course_folder:
                course_title = course["title"]
                course_complete = course.get("complete", True)
                break
        
        st.title(f"Course: {course_title}")
        
        # Show status for in-progress courses
        if not course_complete:
            st.warning("⚠️ This course is still being generated. Some content may be incomplete or missing.")
            if st.button("Refresh to check progress"):
                st.rerun()
        
        # Add back button
        if st.button("← Back to Courses"):
            st.session_state.selected_course = None
            st.session_state.selected_unit = None
            st.session_state.selected_subunit = None
            st.rerun()
        
        # Get units
        units = self._get_units(course_folder)
        
        if not units:
            st.warning("No units found in this course.")
            return
            
        st.write("### Units")
        
        for unit in units:
            if st.button(f"Unit {unit['number']}: {unit['title']}", key=f"unit_{unit['number']}", use_container_width=True):
                st.session_state.selected_unit = unit["folder"]
                st.session_state.selected_subunit = None
                st.rerun()
        
    def render_subunit_list(self, course_folder, unit_folder):
        """Render the list of subunits for a unit"""
        # Get unit title
        unit_title = unit_folder
        units = self._get_units(course_folder)
        for unit in units:
            if unit["folder"] == unit_folder:
                unit_title = f"Unit {unit['number']}: {unit['title']}"
                break
        
        st.title(unit_title)
        
        # Add back buttons
        col1, col2 = st.columns(2)
        with col1:
            if st.button("← Back to Course"):
                st.session_state.selected_unit = None
                st.session_state.selected_subunit = None
                st.rerun()
        
        # Get subunits
        subunits = self._get_subunits(course_folder, unit_folder)
        
        if not subunits:
            st.warning("No subunits found in this unit.")
            return
            
        st.write("### Subunits")
        
        for subunit in subunits:
            if st.button(f"Subunit {subunit['number']}: {subunit['title']}", key=f"subunit_{subunit['number']}", use_container_width=True):
                st.session_state.selected_subunit = subunit["file"]
                st.rerun()
        
    def render_subunit_content(self, course_folder, unit_folder, subunit_file):
        """Render the content of a subunit"""
        # Get subunit info
        frontmatter, content = self._read_subunit_content(course_folder, unit_folder, subunit_file)
        
        # Get subunit and unit titles
        subunit_title = frontmatter.get("title", subunit_file)
        unit_title = frontmatter.get("unit", unit_folder)
        
        # Page title with breadcrumbs
        st.title(f"{subunit_title}")
        st.caption(f"Unit: {unit_title}")
        
        # Back buttons
        col1, col2 = st.columns(2)
        with col1:
            if st.button("← Back to Unit"):
                st.session_state.selected_subunit = None
                st.rerun()
        
        # Display learning objectives if available
        learning_objectives = frontmatter.get("learning_objectives", [])
        if learning_objectives:
            with st.expander("Learning Objectives", expanded=True):
                for objective in learning_objectives:
                    st.markdown(f"- {objective}")
        
        # Display content
        st.divider()
        st.markdown(content, unsafe_allow_html=False)
    
    def render(self):
        """Main render method to display the Streamlit UI"""
        # Initialize session state if needed
        if "selected_course" not in st.session_state:
            st.session_state.selected_course = None
        if "selected_unit" not in st.session_state:
            st.session_state.selected_unit = None
        if "selected_subunit" not in st.session_state:
            st.session_state.selected_subunit = None
        
        # Set up navigation
        if st.session_state.selected_subunit:
            # Display subunit content
            self.render_subunit_content(
                st.session_state.selected_course,
                st.session_state.selected_unit,
                st.session_state.selected_subunit
            )
        elif st.session_state.selected_unit:
            # Display subunit list
            self.render_subunit_list(
                st.session_state.selected_course,
                st.session_state.selected_unit
            )
        elif st.session_state.selected_course:
            # Display unit list
            self.render_unit_list(st.session_state.selected_course)
        else:
            # Display course list
            self.render_course_list()


# Set up the Streamlit page
st.set_page_config(
    page_title="CourseGPT Viewer & Creator",
    page_icon="📚",
    layout="wide",
)

# Apply custom styling
st.markdown("""
<style>
    .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
    }
    h1 {
        margin-bottom: 1.5rem;
    }
    .stButton button {
        text-align: left;
        height: auto;
        padding: 0.5rem 1rem;
        white-space: normal;
        border-radius: 0.3rem;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state for view switching
if "view" not in st.session_state:
    st.session_state.view = "viewer"

# Create the appropriate component based on the view
if st.session_state.view == "creator":
    creator = CourseCreator()
    creator.render_creator_ui()
else:
    viewer = CourseViewer(output_dir=OUTPUT_DIR)
    viewer.render() 