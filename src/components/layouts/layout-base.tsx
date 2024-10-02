import { Outlet } from "react-router-dom";
import { ModeToggle } from "../mode-toogle";
import Header from "../header";

const Visitant = () => {
  return (
    <div className="flex flex-col items-center justify-center m-5">
      <Header/>
      <Outlet />
      <ModeToggle />
    </div>
  )
}

export default Visitant;
