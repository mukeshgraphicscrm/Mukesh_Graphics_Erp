# Mukesh Graphics ERP

A modern, full-stack Enterprise Resource Planning (ERP) dashboard tailored for B2B printing and packaging operations. This system provides a unified interface for managing customers, orders, inventory, production, artworks, and more.

## 🚀 Feature

- **Real-time Dashboard**: Interactive KPI metrics and visually rich charts (Orders, Revenue, Dispatches).
- **Customer & Supplier Directory**: Manage B2B clients, outstanding ledgers, and suppliers.
- **Comprehensive Modules**: Scalable backend and frontend architecture for:
  - **Quotations & Orders**: Seamlessly convert quotes to live orders.
  - **Products & Materials**: Maintain a catalog of custom packaging products and raw materials.
  - **Purchase & GRN**: Create and track purchase orders with suppliers.
  - **Production Jobs**: Track jobs through prepress, printing, and post-press.
  - **Dispatch**: Manage logistics, vehicles, drivers, and tracking statuses.
  - **Accounts & Payments**: Issue invoices, track GST, handle overdue payments, and customer ledgers.
- **Clean UI**: A pixel-perfect, premium dashboard interface heavily optimized for desktop workflows.

## 💻 Tech Stack

**Frontend (Client):**
- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) (Icons)
- [Recharts](https://recharts.org/) (Data Visualization)
- [SheetJS / xlsx](https://sheetjs.com/) (Excel Exporting)

**Backend (Server):**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup) (Firestore Database)

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- A Firebase project with a Firestore database enabled.

### 2. Clone the Repository
```bash
git clone https://github.com/mukeshgraphicscrm/Mukesh_Graphics_Erp.git
cd Mukesh_Graphics_Erp
```

### 3. Backend Setup (Server)
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory using the provided `.env.example` as a template:
```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
Start the backend development server:
```bash
npm run dev
```

### 4. Frontend Setup (Client)
Open a new terminal window and navigate to the client folder:
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory using the provided `.env.example` as a template:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_BASE_URL=http://localhost:5000/api
```
Start the frontend development server:
```bash
npm run dev
```
The dashboard will automatically be available at `http://localhost:5173`.

---

## ☁️ Deployment

### Backend (Render)
1. Connect your repository to [Render](https://render.com).
2. Create a new **Web Service**.
3. Set the **Root Directory** to `server`.
4. Set the Build Command to `npm install` and Start Command to `npm start`.
5. Add your Firebase environment variables in the Render dashboard.

### Frontend (Vercel)
1. Connect your repository to [Vercel](https://vercel.com).
2. Import the project and set the **Root Directory** to `client`.
3. Vercel will automatically detect the **Vite** framework.
4. Add all your `VITE_` environment variables in the Vercel dashboard. 
5. **CRITICAL:** Update `VITE_API_BASE_URL` to point to your live Render backend URL instead of localhost.
"# Mukesh_Graphics_Erp" 
