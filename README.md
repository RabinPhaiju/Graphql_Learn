# Why graphql?

- It creates fast and flexible APIs, giving clients compelete control to ask for just the data they need.
- Fewer HTTP requests. Flexible data querying.
- Less code to manage.

# What is a Graph?

- It is a model/table/collection.

# Mutation

- create, update, delete operation

# Enum

- A special type taht defines a set of constants.
- The type can be used as the type fro a field (Similar to scalar and custom object type)
- Values for the field must be one of the constants for the type
- eg:- UserRole - standard, editor, admin

# Prisma

- Prisma is an open source next-generation ORM.
  - Prisma Client: Auto-generated and type-safe query builder for Node.js & TypeScript
  - Prisma Migrate (Preview): Migration system
  - Prisma Studio: GUI to view and edit data in your database

# Migrate

- npx prisma migrate dev --name init --preview-feature

# Seed

- npx prisma db seed --preview-feature

# Studio

- npx prisma studio

# Login

- <h1>TODO</h1>
- Mutation -> createProfile -> take userID from token instead of passing through argument
