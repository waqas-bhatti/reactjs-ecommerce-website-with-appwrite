import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Layout from "./Layout.jsx";
import Home from "./components/Home.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import ProductCard from "./pages/ProductCard.jsx";
import CardDetail from "./pages/CardDetail.jsx";
import { Provider } from "react-redux";
import store from "./reduxStore/store.js";
import CheckOut from "./pages/CheckOut.jsx";
import CheckoutForm from "./pages/CheckoutForm.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProfileDashboard from "./pages/ProfileDashboard.jsx";
import Order from "./pages/Order.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import RecoverEmail from "./pages/RecoverEmail.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            {" "}
            <ProductCard />{" "}
          </ProtectedRoute>
        }
      />
      <Route path="products/:id" element={<CardDetail />} />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            {" "}
            <CheckOut />{" "}
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout-form"
        element={
          <ProtectedRoute>
            {" "}
            <CheckoutForm />{" "}
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/profile"
        element={
          <ProtectedRoute>
            {" "}
            <ProfileDashboard />
          </ProtectedRoute>
        }
      /> */}
      <Route
        path="/order-page"
        element={
          <ProtectedRoute>
            {" "}
            <Order />{" "}
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-detail/:orderId"
        element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forgotpassword/:userId/:secret"
        element={<RecoverEmail />}
      />
      <Route
        path="/reset-password/:userId/:secret"
        element={<ResetPassword />}
      />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);
