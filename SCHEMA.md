# Database Schema

## collections
| Column      | Type     | Notes          |
|-------------|----------|----------------|
| id          | UUID     | PK             |
| name        | String   | required       |
| description | String   | nullable       |
| created_at  | DateTime |                |
| updated_at  | DateTime |                |

## requests
| Column       | Type    | Notes                              |
|--------------|---------|------------------------------------|
| id           | UUID    | PK                                 |
| collection_id| UUID    | FK → collections, nullable         |
| name         | String  |                                    |
| method       | String  | GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS |
| url          | String  |                                    |
| headers      | JSON    |                                    |
| params       | JSON    |                                    |
| body_type    | String  | none/raw/form-data/urlencoded      |
| body_content | Text    | nullable                           |
| auth_type    | String  | none/bearer/basic                  |
| auth_config  | JSON    |                                    |
| created_at   | DateTime|                                    |
| updated_at   | DateTime|                                    |

## environments
| Column     | Type     | Notes |
|------------|----------|-------|
| id         | UUID     | PK    |
| name       | String   |       |
| created_at | DateTime |       |
| updated_at | DateTime |       |

## environment_variables
| Column         | Type    | Notes              |
|----------------|---------|--------------------|
| id             | UUID    | PK                 |
| environment_id | UUID    | FK → environments  |
| key            | String  |                    |
| value          | String  |                    |
| enabled        | Boolean | default true       |

## history
| Column             | Type     | Notes |
|--------------------|----------|-------|
| id                 | UUID     | PK    |
| method             | String   |       |
| url                | String   |       |
| headers            | JSON     |       |
| params             | JSON     |       |
| body_type          | String   |       |
| body_content       | Text     |       |
| auth_type          | String   |       |
| auth_config        | JSON     |       |
| response_status    | Integer  |       |
| response_time_ms   | Integer  |       |
| response_size_bytes| Integer  |       |
| response_headers   | JSON     |       |
| response_body      | Text     |       |
| executed_at        | DateTime |       |