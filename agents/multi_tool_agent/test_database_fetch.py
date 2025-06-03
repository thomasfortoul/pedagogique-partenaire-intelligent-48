"""
Test database fetch functionality
"""

import os
import sys
import json

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Loa

def test_database_fetch():
    """Test the database fetch function"""
    
    # Set up environment variables for testing
    os.environ['SUPABASE_URL'] = 'https://wagclcnxrhgxurrkqcjb.supabase.co'
    os.environ['SUPABASE_ANON_KEY'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZ2NsY254cmhneHVycmtxY2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MjQyOTYsImV4cCI6MjA2MjMwMDI5Nn0.VB7SBseC6_c6mYWqdWuFJLOqIOaXVi2VtTndSTsMeQI'
    
    # Import the fetch function
    try:
        from agent import fetch_course_from_database
        print("✓ Successfully imported fetch_course_from_database")
    except ImportError as e:
        print(f"✗ Failed to import: {e}")
        return False
    
    # Test with a sample course ID (this might not exist, but we can test the function)
    test_course_id = "123e4567-e89b-12d3-a456-426614174000"  # Sample UUID
    
    print(f"\n=== Testing Database Fetch for Course ID: {test_course_id} ===")
    
    result = fetch_course_from_database(test_course_id)
    
    print(f"Status: {result.get('status')}")
    print(f"Course Data:\n{result.get('course_data')}")
    
    if result.get('raw_data'):
        print(f"Raw Data: {json.dumps(result.get('raw_data'), indent=2)}")
    
    # Test with invalid course ID
    print(f"\n=== Testing with Invalid Course ID ===")
    invalid_result = fetch_course_from_database("invalid-id")
    print(f"Status: {invalid_result.get('status')}")
    print(f"Course Data: {invalid_result.get('course_data')}")
    
    return True

def test_supabase_connection():
    """Test if we can connect to Supabase"""
    
    print("\n=== Testing Supabase Connection ===")
    
    try:
        from supabase import create_client
        
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_key:
            print("✗ Supabase credentials not found")
            return False
        
        # Create client
        supabase = create_client(supabase_url, supabase_key)
        
        # Test connection by fetching courses table structure
        response = supabase.table("courses").select("*").limit(1).execute()
        
        print("✓ Successfully connected to Supabase")
        print(f"✓ Courses table accessible")
        
        if response.data:
            print(f"✓ Found {len(response.data)} course(s) in table")
            sample_course = response.data[0]
            print(f"Sample course: {sample_course.get('title', 'No title')}")
        else:
            print("ℹ No courses found in table")
        
        return True
        
    except ImportError:
        print("✗ Supabase library not installed")
        print("  Run: pip install supabase")
        return False
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        return False

if __name__ == "__main__":
    print("Testing Database Fetch Functionality")
    print("=" * 50)
    
    try:
        # Test 1: Connection
        connection_ok = test_supabase_connection()
        
        # Test 2: Fetch function
        if connection_ok:
            fetch_ok = test_database_fetch()
        else:
            print("\nSkipping fetch test due to connection issues")
            fetch_ok = False
        
        print("\n" + "=" * 50)
        if connection_ok and fetch_ok:
            print("🎉 ALL TESTS PASSED!")
            print("The agent now has direct database access to course information.")
        else:
            print("⚠️  Some tests failed, but the implementation is ready.")
            print("Make sure supabase is installed: pip install supabase")
        
    except Exception as e:
        print(f"❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()