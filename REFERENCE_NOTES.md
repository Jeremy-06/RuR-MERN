# Reference Notes — `itcp318-ns-2026`

Source of truth for RuR's architecture, structure, naming and style. Everything below was read from the
reference code; where the reference is inconsistent or incomplete, that is called out explicitly.

## 1. Folder structure and naming

### Backend (`backend/`, CommonJS, Express 5, Mongoose 9)

```
backend/
├── server.js            # loads dotenv, connects DB, configures cloudinary, app.listen
├── app.js               # express app: cors, cookieParser, json/urlencoded (50mb), mounts routers on /api/v1
├── config/
│   ├── database.js      # connectDatabase() -> mongoose.connect(process.env.DB_URI)
│   └── .env             # real secrets (gitignored); env.txt is the committed template
├── models/              # singular, lowercase: product.js, user.js, order.js
├── controllers/         # singular, lowercase, one per resource: product.js, auth.js, order.js
├── routes/              # same names as controllers: product.js, auth.js, order.js
├── middleware/auth.js   # isAuthenticatedUser, authorizeRoles
└── utils/               # camelCase helpers: apiFeatures.js, jwtToken.js, multer.js, sendEmail.js
```

- Files are lowercase singular nouns (`product.js`), utils are camelCase (`apiFeatures.js`).
- Models export `mongoose.model('Product', productSchema)` (PascalCase model, `xxxSchema` variable).
- Controllers export named handlers with `exports.name = async (req, res, next) => {}`
  (`newProduct`, `getSingleProduct`, `getProducts`, `updateProduct`, `deleteProduct`, `getAdminProducts`).
- Routes destructure the controller exports in a multi-line `const { ... } = require('../controllers/x')`
  and declare one `router.<verb>(path, ...middleware, handler)` per line; `router.route(path).get().put().delete()`
  is used when several verbs share a path.
- URL style: public `/products`, `/product/:id`; admin `/admin/products`, `/admin/product/new`, `/admin/product/:id`.

### Frontend (`frontend/`, Vite + React 19)

```
frontend/src/
├── main.jsx             # <Provider store={store}><App /></Provider>
├── App.jsx              # BrowserRouter + all <Route>s, cart state, Header/Footer/ToastContainer
├── store.js             # legacy_createStore + combineReducers + thunk
├── constants/           # productConstants.jsx, userConstants.jsx, cartConstants.js, orderConstants.js
├── actions/             # productActions.jsx, userActions.jsx  (thunks: dispatch REQUEST/SUCCESS/FAIL)
├── reducers/            # productReducers.jsx, userReducers.jsx
└── Components/          # PascalCase folders and files
    ├── Home.jsx
    ├── Layout/          # Header, Footer, Loader, MetaData (react-helmet), Search
    ├── Product/         # Product (card), ProductDetails
    ├── User/            # Login, Register, Profile, UpdateProfile, UpdatePassword, ForgotPassword, NewPassword
    ├── Admin/           # Dashboard, SideBar, ProductsList, NewProduct, UpdateProduct, ...Chart, UsersList, ...
    ├── Route/ProtectedRoute.jsx
    └── Utils/helpers.jsx  # getUser, authenticate, logout, getToken, errMsg, successMsg
```

- Components are arrow functions `const X = () => { ... }` with `export default X` at the bottom
  (exception: `export const Header`, charts use `export default function`).
- Each page renders `<MetaData title={'...'} />` first and uses `<Loader />` while `loading`.
- Admin pages use a 2/10 grid: `<div className="col-12 col-md-2"><Sidebar /></div>` + `col-md-10` content.
- API base URL comes from `import.meta.env.VITE_API` (`http://localhost:4001/api/v1`).
- Most pages call axios directly inside the component (`const getX = async () => {...}` + `useEffect`);
  Redux is only used for products list, product details and auth (login/logout).

## 2. Models / routes / controllers / middleware split

- **Model**: schema + validators with custom messages (`required: [true, 'Please enter product name']`,
  `maxLength`, `enum: { values, message }`, `validator.isEmail`). User model owns auth behaviour as
  methods: `pre('save')` bcrypt hash, `getJwtToken()`, `comparePassword()`, `getResetPasswordToken()`.
- **Route**: only wiring — path + middleware chain (`isAuthenticatedUser`, `authorizeRoles('admin')`,
  `upload.array('images', 10)` / `upload.single('avatar')`) + controller.
- **Controller**: all logic, talks to the model and cloudinary directly, sends the response.
- **Middleware** (`middleware/auth.js`): `isAuthenticatedUser` (JWT → `req.user`) and
  `authorizeRoles(...roles)` (returns a middleware that checks `roles.includes(req.user.role)`).

## 3. Auth flow

- **Token type**: JWT signed with `jwt.sign({ id: this._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_TIME })`.
- **Issuing**: `utils/jwtToken.js` `sendToken(user, statusCode, res)` sets an **httpOnly cookie named `token`**
  (expires after `COOKIE_EXPIRES_TIME` days) and responds `{ success: true, user }`.
- **Reading**: `isAuthenticatedUser` reads `req.cookies.token` (a Bearer-header version is left commented out),
  verifies it and loads `req.user = await User.findById(decoded.id)`.
- **Roles**: `role` string on the user, default `'user'`; `authorizeRoles('admin')` returns 403
  `Role (x) is not allowed to acccess this resource`.
- **Frontend**: login is a Redux thunk using `withCredentials: true` (cookie). `Header` reads `state.auth.user`.
  `ProtectedRoute({ children, isAdmin })` redirects to `/login` (no user) or `/` (not admin).
- **Inconsistency in reference**: many pages still send `Authorization: Bearer ${getToken()}` from
  sessionStorage and `ProtectedRoute` reads `getUser()` from sessionStorage, but login never writes there and
  the backend ignores the header. The cookie is the mechanism that actually works → RuR uses the cookie only.
- Logout: `GET /logout` overwrites the cookie with `null` and an immediate expiry.

## 4. File upload handling

- **Library**: `multer` (`utils/multer.js`): `limits: { fieldSize: 100MB }`, `storage: multer.diskStorage({})`,
  `fileFilter` allows `.jpg/.jpeg/.png` only.
- **Field names**: `upload.array('images', 10)` for products, `upload.single('avatar')` for users.
- **What actually happens**: the frontend reads files with `FileReader.readAsDataURL` and sends **base64
  strings** (`images` array / `avatar` string) in the body. The controller normalises
  `typeof req.body.images === 'string' ? [images] : images`, uploads each with
  `cloudinary.v2.uploader.upload(img, { folder: 'products', width: 150, crop: 'scale' })` and stores
  `{ public_id, url: secure_url }`.
- **Storage location**: Cloudinary folders `products` and `avatars` (no local disk storage).
- **Deleting**: `cloudinary.v2.uploader.destroy(public_id)` (done for avatars on profile update / user delete;
  the reference does not destroy product images on update/delete).
- **Size validation**: none besides multer's fieldSize and express's 50mb body limit.

## 5. DataTables pattern

**The reference has no jQuery DataTables and no server-side table processing.** All admin tables use
`@mui/x-data-grid` `<DataGrid>` with client-side paging: the page fetches the whole collection
(`GET /admin/products` → `{ success, products }`), maps it to `rows` (`id: product._id`), and declares
`columns` with `field`, `headerName`, `flex`/`width`, `align`, and a `renderCell` "actions" column with
edit (`fa-pencil` link) and delete (`fa-trash` button). Props: `pageSize`, `rowsPerPageOptions`,
`disableSelectionOnClick`, `getRowId`, `showToolbar`.

The closest server-side processing in the reference is `utils/apiFeatures.js` for the shop list:
- `new APIFeatures(Product.find(), req.query).search().filter()` then `.pagination(resPerPage)`.
- **Bracket params**: Express 5's default query parser keeps them flat, so the reference reads them as
  literal string keys: `queryCopy['price[gte]']`, `queryCopy['price[lte]']`, converting with `Number(...)`.
  Verified: `?search[value]=key&order[0][column]=2` arrives as
  `{ 'search[value]': 'key', 'order[0][column]': '2' }`. Server-side table params must be read the same way.
- Response shape: `{ success, products, productsCount, filteredProductsCount, resPerPage }`.

## 6. API response format and error handling

- Success: `res.status(200|201).json({ success: true, <resource> })` (e.g. `{ success, product }`,
  `{ success, users }`, `{ success, message: 'Product deleted' }`).
- Errors: early `return res.status(4xx).json({ success: false, message: '...' })` or just `{ message }`
  (a few places use `{ error }`). There is **no global error handler and no try/catch** around most awaits,
  so validation/cast errors fall through to Express's default HTML 500.
- Frontend reads `error.response.data.message` and shows it in a toast.

## 7. Validation, alerts, config

- **Validation**: Mongoose schema validators + a few manual checks in controllers (`if (!email || !password)`,
  password match). No frontend validation library; inputs are plain controlled `form-control` fields.
- **Alerts**: `react-toastify` — `toast.success/error(msg, { position: 'bottom-right' })`, or helpers
  `errMsg` / `successMsg` from `Utils/helpers.jsx` (`bottom-center`). `<ToastContainer />` in `App.jsx`.
- **Confirm dialogs**: SweetAlert2 —
  `Swal.fire({ title, icon: 'info', text, confirmButtonText: 'Delete', showCancelButton: true }).then(result => { if (result.isConfirmed) ... })`
  (used in `ProductReviews`).
- **Env/config** (RuR keeps this location: secrets go in `backend/config/.env`, template in `backend/config/.env.example`; frontend `frontend/.env` with `VITE_` keys read via `import.meta.env`): backend `dotenv.config({ path: './config/.env' })` in `server.js`; keys `PORT, NODE_ENV,
  DB_URI, CLOUDINARY_*, JWT_SECRET, JWT_EXPIRES_TIME, COOKIE_EXPIRES_TIME, SMTP_*`. Frontend `.env`
  `VITE_API`. CORS: `origin: "http://localhost:5173", credentials: true`.
- **Categories**: hard-coded `enum` in the product model **and** the same array duplicated in
  `NewProduct.jsx` / `UpdateProduct.jsx`.

## 8. Code and comment style

- Backend: 4-space indent, single quotes, semicolons used inconsistently, `const x = require('x')` at top.
- Frontend components: 4-space indent; `App.jsx`/`main.jsx`: 2-space.
- Comments are sparse `//` line comments in sentence case describing the next step, e.g.
  `// Checks if email and password is entered by user`, `// Get reset token`, `// Hash and set to resetPasswordToken`,
  and route headers like `// Create a new order   =>  /api/v1/order/new`. No JSDoc, no block comments.
  JSX comments are `{/* ... */}`. The reference leaves old code commented out; RuR will not.

## Deviations

Planned, because Tasks 1–4 require things the reference does not have:

| Deviation | Reason |
| --- | --- |
| MUI (`@mui/material`) theme (`src/theme.js`, same colors/fonts as the `--rur-*` CSS variables) with `ThemeProvider` + `CssBaseline` in `main.jsx`; `Header` is an MUI `AppBar` with an account `Menu`; `SideBar` is an MUI `List` of `NavLink`s; `App.jsx` wraps routes in an MUI `Container` and groups them as public / user / admin | Task 1 requires a Material UI layout. Component/file names (`Header`, `SideBar`, `ProtectedRoute`, `MetaData`, `Loader`) and the reference "Sidebar in a 2/10 grid" admin page layout stay the same. The Bootstrap 4 + Font Awesome CDN stays in `index.html` because the kept pages for later tasks (cart, orders, reviews, users, charts) still use it. |
| Formik + Yup (`useFormik`, schema next to each form) on Login, Register, UpdateProfile and the product dialog; shared image rules (`IMAGE_TYPES`, `MAX_IMAGE_SIZE`, `avatarSchema`, `readAsDataURL`) live in `Utils/helpers.jsx` | Task 2/4 require schema validation with field-level errors; reference has none. Backend mirrors the same rules: `validateUser` in `controllers/auth.js` (runs before the avatar upload, also checks avatar type/size and unique email on profile update) plus the Mongoose validators. |
| Firebase Auth (frontend) + `firebase-admin` (backend) Google login | Task 2. Backend verifies the ID token then calls the same `sendToken` → same cookie JWT. |
| Admin products table uses `datatables.net-dt@2.3.8` (jQuery DataTables, `serverSide: true`) instead of the reference's client-side `@mui/x-data-grid`. Backend adds `dataTableSearch`, `dataTableSort`, `dataTablePagination` to `utils/apiFeatures.js`, reading the bracket params as flat keys exactly like `filter()` reads `price[gte]` (`search[value]`, `order[0][column]` -> `columns[n][data]`, `order[0][dir]`, `start`, `length`). `GET /admin/products` keeps the reference response shape `{ success, products, productsCount, filteredProductsCount }` + `draw`; the frontend `dataSrc` maps the counts to `recordsTotal`/`recordsFiltered`. Without DataTables params it still returns every product (Dashboard) | Task 4 requires DataTables server-side processing. 3.x was a week old, so the stable 2.x line is used; it sends params through `jQuery.ajax`, which is what produces the bracket notation. Sorting is limited to an allowlist (`name, category, price, stock, createdAt`). |
| Row checkboxes, select-all and action buttons are rendered as HTML by DataTables and handled with delegated listeners on the table; selection is kept in a ref so it survives paging/search; "Delete selected" confirms with SweetAlert2 and calls `DELETE /admin/products` | Task 4. Same `Swal.fire({ ..., showCancelButton: true }).then(result => ...)` pattern as the reference. |
| `NewProduct.jsx` / `UpdateProduct.jsx` pages and their `/admin/product`, `/admin/product/:id` routes replaced by `ProductDialog.jsx` (MUI `Dialog`) opened from the products page | Task 4 requires the create/edit form in an MUI dialog. |
| Product `seller` is optional (default `RuR Gear`), `stock` must be a whole number, and a product must keep at least one image on create/update | Task 3 spec lists name, description, price, category, stock, images; the dialog only asks for those. Seed data and ProductDetails still use `seller`. |
| Profile shows role + account type and hides "Change Password" for Google accounts | Google-only accounts have no password (backend already refuses it). |
| Product images: file-size check and destroying Cloudinary images on remove/update/delete | Task 3 requires it; reference never destroys product images. |
| Bulk delete endpoint | Task 3; not in reference. |
| Cookie-only auth on the frontend (no sessionStorage Bearer token) | Reference's Bearer path never works (backend ignores the header). |
| Global error handler in `app.js` returning `{ message }` | Reference returns HTML 500s on validation/cast errors, which the frontend can't display. |
| `config/seed.js` (default admin + gaming catalog) | Needed to have an admin account without editing the DB by hand. |
| Product images sent as real files (`multipart/form-data`, field `images`) instead of base64 strings; `utils/multer.js` uses `memoryStorage` with `fileSize: 5MB`, `files: 10`, jpg/jpeg/png/webp filter, and the controller streams each buffer to Cloudinary with `upload_stream` | Cloudinary integration requires real type/size validation. `multer-storage-cloudinary@4` only supports `cloudinary@^1` (project uses `^2`), so the reference's multer + cloudinary approach was adapted instead. |
| Product update keeps existing images and takes `removeImages` (public_ids) + new `images`; removed, deleted and bulk-deleted images are destroyed in Cloudinary (only `rur/products/*`, never seed images); uploads are rolled back if the save fails | Cloudinary integration / Task 3. Reference replaces all images and never destroys product images. |
| `DELETE /admin/products` with `{ ids: [...] }` (bulk delete) | Task 3. Shares the `router.route('/admin/products')` path with the admin list. |
| `config/cloudinary.js` (`connectCloudinary`) and `config/firebase.js` (`connectFirebase`, `getFirebaseAuth`) called from `server.js`, same style as `config/database.js` | Reference configures cloudinary inline in `server.js`. |
| Startup check in `server.js` that names each missing required env var and exits | Requested: clear error on missing env vars. |
| Google login: `firebase` on the frontend (`src/firebase.js`, `GoogleLogin.jsx` MUI button on Login/Register), `firebase-admin` on the backend, `POST /login/google` verifies the ID token and calls the same `sendToken` cookie JWT. User model gains `authProvider` (`local`/`google`); password is required only for `local`. Password login and change password are refused for Google-only accounts | Task 2. If `FIREBASE_SERVICE_ACCOUNT_PATH` is missing the server still starts, logs a warning, and the endpoint returns 503. |
| Avatars are only destroyed in Cloudinary when their public_id starts with `rur/avatars/` | Google avatars are external URLs with `public_id: 'google'`. |
| Global error handler maps multer errors to 400 and only logs stack traces for 5xx | Upload validation messages must reach the frontend toast. |
