#!/bin/bash

# Configuration
BASE_URL="http://localhost:1111/api"
EMAIL="user@example.com"
PASSWORD="user"

echo "🏋️ Testing Workout & Exercise API"
echo "================================"

# Step 1: Login and get session cookie
echo "1. Logging in..."
COOKIE_JAR="/tmp/cookies.txt"
LOGIN_RESPONSE=$(curl -s -c $COOKIE_JAR -X POST "$BASE_URL/login" \
-H 'Content-Type: application/json' \
-d '{
    "identifier": "'$EMAIL'",
    "password": "'$PASSWORD'"
}')

# Verify login success
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.id')
if [ "$USER_ID" == "null" ] || [ -z "$USER_ID" ]; then
    echo "Error during login: $LOGIN_RESPONSE"
    exit 1
fi
echo "✅ Logged in successfully as user ID: $USER_ID"

# Step 2: Get workout categories
echo "2. Getting workout categories..."
CATEGORIES_RESPONSE=$(curl -s -b $COOKIE_JAR -X GET "$BASE_URL/workout-categories")

# Debug: Print categories
echo "Categories response:"
echo "$CATEGORIES_RESPONSE" | jq .

# Get first category ID
CATEGORY_ID=$(echo "$CATEGORIES_RESPONSE" | jq -r '.[0].id')
if [ "$CATEGORY_ID" == "null" ] || [ -z "$CATEGORY_ID" ]; then
    echo "Error: No workout categories found"
    exit 1
fi
echo "✅ Using category ID: $CATEGORY_ID"

# Step 3: Create Workout
echo "3. Creating workout..."
WORKOUT_DATA='{
    "categoryId": 1,
    "date": "2024-03-27",
    "duration": 60,
    "intensity": 8,
    "notes": "Test workout with exercises"
}'

echo "Sending workout data:"
echo "$WORKOUT_DATA" | jq .

WORKOUT_RESPONSE=$(curl -s -b $COOKIE_JAR -X POST "$BASE_URL/workouts" \
-H 'Content-Type: application/json' \
-d "$WORKOUT_DATA")

# More detailed error handling
if echo "$WORKOUT_RESPONSE" | jq -e '.status == 500' > /dev/null; then
    echo "Server error: $(echo "$WORKOUT_RESPONSE" | jq -r '.message')"
    exit 1
fi

# Debug: Print response
echo "Workout creation response:"
echo "$WORKOUT_RESPONSE" | jq .

WORKOUT_ID=$(echo "$WORKOUT_RESPONSE" | jq -r '.id')
if [ "$WORKOUT_ID" == "null" ] || [ -z "$WORKOUT_ID" ]; then
    echo "Error: Invalid workout ID"
    echo "Response: $WORKOUT_RESPONSE"
    exit 1
fi
echo "✅ Created workout with ID: $WORKOUT_ID"

# Step 4: Add Exercises
echo "4. Adding exercises..."
EXERCISE1_RESPONSE=$(curl -s -b $COOKIE_JAR -X POST "$BASE_URL/workouts/$WORKOUT_ID/exercises" \
-H 'Content-Type: application/json' \
-H "Accept: application/json" \
-d '{
    "name": "Bench Press",
    "sets": 3,
    "reps": 12,
    "weight": 70.5,
    "duration": 300,
    "notes": "Keep elbows tucked",
    "distance": 10
}')

# Debug exercise response
echo "Exercise 1 response:"
echo "$EXERCISE1_RESPONSE" | jq .

if echo "$EXERCISE1_RESPONSE" | jq -e '.status == 500' > /dev/null; then
    echo "Error creating exercise: $(echo "$EXERCISE1_RESPONSE" | jq -r '.message')"
    exit 1
fi

EXERCISE2_RESPONSE=$(curl -s -b $COOKIE_JAR -X POST "$BASE_URL/workouts/$WORKOUT_ID/exercises" \
-H 'Content-Type: application/json' \
-H "Accept: application/json" \
-d '{
    "name": "Squats",
    "sets": 4,
    "reps": 10,
    "weight": 100,
    "duration": 400,
    "notes": "Focus on form",
    "distance": 10
}')

echo "Exercise 2 response:"
echo "$EXERCISE2_RESPONSE" | jq .

if echo "$EXERCISE2_RESPONSE" | jq -e '.status == 500' > /dev/null; then
    echo "Error creating exercise: $(echo "$EXERCISE2_RESPONSE" | jq -r '.message')"
    exit 1
fi

# Update error handling for exercise creation
EXERCISE1_ID=$(echo "$EXERCISE1_RESPONSE" | jq -r '.id // empty')
if [ -z "$EXERCISE1_ID" ]; then
    echo "Error: Invalid exercise response"
    echo "Response: $EXERCISE1_RESPONSE"
    exit 1
fi

EXERCISE2_ID=$(echo "$EXERCISE2_RESPONSE" | jq -r '.id // empty')
if [ -z "$EXERCISE2_ID" ]; then
    echo "Error: Invalid exercise response"
    echo "Response: $EXERCISE2_RESPONSE"
    exit 1
fi

if [ "$EXERCISE1_ID" == "null" ] || [ "$EXERCISE2_ID" == "null" ]; then
    echo "Error: Invalid exercise IDs"
    exit 1
fi
echo "✅ Created exercises with IDs: $EXERCISE1_ID, $EXERCISE2_ID"

# Step 5: Get Workout Details
echo "5. Getting workout details..."
curl -s -b $COOKIE_JAR -X GET "$BASE_URL/workouts/$WORKOUT_ID" | jq .

# Clean up cookie file
rm -f $COOKIE_JAR
echo "✅ Test complete"