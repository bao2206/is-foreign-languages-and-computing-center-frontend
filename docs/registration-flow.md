```mermaid
flowchart TD
    A[Start Registration] --> B[User Enters Details]
    B --> C{Validate Input}
    
    C -->|Missing Fields| D[Show Error: Missing Required Fields]
    C -->|Password Mismatch| E[Show Error: Passwords Don't Match]
    C -->|Valid Input| F[Check Username Exists]
    
    F -->|Username Exists| G[Show Error: Username Taken]
    F -->|Username Available| H[Create Auth Account]
    
    H --> I[Create User Profile]
    I --> J[Link Auth & User]
    J --> K[Return Success Response]
    
    K --> L[End Registration]

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style L fill:#f9f,stroke:#333,stroke-width:2px
    style D fill:#ff9,stroke:#333,stroke-width:2px
    style E fill:#ff9,stroke:#333,stroke-width:2px
    style G fill:#ff9,stroke:#333,stroke-width:2px
    style K fill:#9f9,stroke:#333,stroke-width:2px
```

## Registration Flow Description

1. **Start Registration**
   - User initiates registration process

2. **Input Validation**
   - Check for required fields (username, password)
   - Verify password matches confirm password

3. **Username Check**
   - Verify username is not already taken

4. **Account Creation**
   - Create new auth account with role_id
   - Create new user profile
   - Link auth account with user profile

5. **Response**
   - Return success with user details
   - Return error if any step fails

## Error Cases
- Missing required fields
- Password mismatch
- Username already exists
- Server errors during creation 