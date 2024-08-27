### 1. Get Todos with Query Parameters
This endpoint fetches todos based on the provided query parameters.

#### Example 1: Fetch todos with status "TO DO"
```sh
curl -X GET "http://localhost:3000/todos?status=TO%20DO"
```

#### Example 2: Fetch todos with priority "HIGH"
```sh
curl -X GET "http://localhost:3000/todos?priority=HIGH"
```

#### Example 3: Fetch todos with the search query "meeting"
```sh
curl -X GET "http://localhost:3000/todos?search_q=meeting"
```

#### Example 4: Fetch todos with category "WORK"
```sh
curl -X GET "http://localhost:3000/todos?category=WORK"
```

#### Example 5: Fetch todos with due date "2023-10-15"
```sh
curl -X GET "http://localhost:3000/todos?due_date=2023-10-15"
```

#### Example 6: Fetch todos with multiple query parameters
```sh
curl -X GET "http://localhost:3000/todos?status=IN%20PROGRESS&priority=MEDIUM&category=HOME"
```

### 2. Get a Todo by ID
This endpoint fetches a todo by its ID.

#### Example: Fetch todo with ID 1
```sh
curl -X GET "http://localhost:3000/todos/1/"
```

### Notes:
- Ensure the server is running at `http://localhost:3000/`.
- Replace the query parameters and path parameters with actual values as needed.
- The `%20` in the URLs represents a space character (URL encoding).

Feel free to modify the queries according to your needs!
