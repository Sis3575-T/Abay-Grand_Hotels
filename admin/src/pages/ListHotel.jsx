import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { MdDeleteForever } from 'react-icons/md'
import { backendUrl } from '../App'
const ListHotel = () => {
  const [list, setList] = useState([])
  const fetchRoomList = async () =>{
    try {
      const token = localStorage.getItem('adminToken')
      const response = await axios.get(backendUrl + '/api/hotel/list', { headers: { Authorization: token ? `Bearer ${token}` : '' } })
      if(response.data.success) {
        setList(response.data.hotels || [])
        
      } else {
        console.log(response.data.message);
        
      }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(()=> {
    fetchRoomList()
  }, [])
  return (
    <div>
      <p className='mb-2 font-bold text-2xl'>Hotel Rooms </p>
    <div className='flex flex-col gap-2'>
       <div className='grid grid-cols-[1fr_3fr_1fr_1fr] items-center p-2 border-b-2 border-gray-300 text-lg font-semibold' >
        <b>Image</b>
        <b>RoomName</b>
        <b>Price</b>
        <b className='text-center'>Delete</b>
       </div>
       {
        list.map((item) => (
        <div key={item._id || item.id} className='grid grid-cols-[1fr_3fr_1fr_1fr] items-center p-2 border-b-2 border-gray-300 text-lg font-semibold' >
          <img src={item.image} alt={item.name || 'room'} className='w-[50px] h-auto'/>
          <p>{item.name}</p>
          <p>{item.price}</p>
          <MdDeleteForever className='ml-10 text-[28px] cursor-pointer text-red-600'/>
        </div>
        ))
       }
    </div>
    </div>
  )
}

export default ListHotel
