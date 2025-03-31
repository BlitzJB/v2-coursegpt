# CourseGPT API

A FastAPI server that provides endpoints to read course data from the folder structure created by CourseGPT.

## Features

- RESTful API for accessing course content
- Read-only endpoints for courses, units, subunits, and content
- JSON responses with proper typing
- Automatic OpenAPI documentation

## Endpoints

- `GET /courses` - List all courses
- `GET /courses/{course_folder}` - Get details for a specific course
- `GET /courses/{course_folder}/units` - Get all units for a course
- `GET /courses/{course_folder}/units/{unit_folder}` - Get all subunits for a unit
- `GET /courses/{course_folder}/units/{unit_folder}/subunits/{subunit_file}` - Get content for a subunit

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the server:

```bash
python main.py
```

The API will be accessible at http://localhost:8000.

## API Documentation

Once the server is running, you can access the auto-generated documentation at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Configuration

The API reads course data from the `../output` directory by default. You can change this by modifying the `OUTPUT_DIR` constant in `main.py`.

## Integration with Frontend

The API is designed to work with the CourseGPT frontend. Configure the frontend to point to this API instead of using mock data. 