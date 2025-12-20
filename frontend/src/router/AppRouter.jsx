import {BrowserRouter,Routes,Route} from "react-router-dom";
import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

export default function AppRouter(){
    return(
        <BrowserRouter>
            <Routes>                
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    )
}