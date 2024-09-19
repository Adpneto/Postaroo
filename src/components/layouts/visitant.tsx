import { Outlet } from "react-router-dom";
import { ModeToggle } from "../mode-toogle";

const Visitant = () => {
  return (
    <div>
        <Outlet />
        <ModeToggle/>
    </div>
  )
}

 export default Visitant;
