import { Outlet } from "react-router-dom";
import { ModeToggle } from "../mode-toogle";

const Client = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="m-4 flex flex-col items-center">
        <Outlet />
        <ModeToggle />
      </div>
    </div>
  )
}

export default Client;
