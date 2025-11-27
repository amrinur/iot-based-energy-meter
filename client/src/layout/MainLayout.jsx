import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"

const Mainlayout = () => {
  return (
    <div className='w-full min-h-screen bg-gray-900 flex'>
      <Navbar />
      <Outlet />
    </div>
  )
}

export default Mainlayout