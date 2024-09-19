import { Outlet } from "react-router-dom";
import { ModeToggle } from "../mode-toogle";

const Client = () => {
  return (
    <div>
        <Outlet />
        <ModeToggle/>
    </div>
  )
}

export default Client;
