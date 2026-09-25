# Product Admin Dashboard

A responsive Product Admin Dashboard built using Next.js, React, Tailwind CSS, Axios, and DummyJSON API.

## Tech Stack

- Next.js
- React
- JavaScript
- Tailwind CSS
- Axios
- DummyJSON API
- Git & GitHub

## Features

### Authentication
- Login using DummyJSON authentication API
- Username: `emilys`
- Password: `emilyspass`
- Login error handling
- Authentication token stored in localStorage
- Token automatically added to API requests
- Protected product pages
- Logout functionality
- Login button is disabled while request is in progress

### Product Management
- Product list with:
  - Product image
  - Title
  - Category
  - Price
  - Rating
  - Stock
- Responsive desktop table
- Responsive mobile product cards
- Product details page
- Add product
- Edit product
- Delete product
- Delete confirmation dialog

### Search
- Product search using DummyJSON search API
- 500ms debounce
- Search resets pagination to page 1
- Search and category filtering are mutually exclusive because DummyJSON does not support combining both in a single request
- AbortController is used to prevent old search responses from replacing newer results

### Filtering and Sorting
- Filter products by category
- Sort by:
  - Price
  - Rating
  - Title
- Ascending and descending order
- Search/category/sort state is preserved in the URL

### Pagination
- API-based pagination using `limit` and `skip`
- Page sizes:
  - 10
  - 20
  - 50
- Previous and Next buttons
- Page number buttons
- Result range such as:
  `Showing 21-40 of 194`

### Validation
- Required field validation
- Price validation
- Stock validation
- Product form validation
- Duplicate form submission prevention

### Loading and Error Handling
- Loading spinner
- Empty state
- Search no-results state
- API error message
- Retry option
- Invalid URL values are handled safely

## Project Structure

```text
product-admin-dashboard/
│
├── app/
│   ├── page.js
│   ├── globals.css
│   │
│   └── products/
│       ├── page.js
│       ├── add/
│       │   └── page.js
│       │
│       └── [id]/
│           ├── page.js
│           └── edit/
│               └── page.js
│
├── components/
│   ├── Navbar.js
│   ├── ProductTable.js
│   ├── ProductCard.js
│   ├── Pagination.js
│   ├── SearchBar.js
│   ├── ProductFilters.js
│   └── Loader.js
│
├── lib/
│   ├── axios.js
│   ├── api.js
│   └── productStore.js
│
├── public/
├── package.json
└── README.md