import axios from 'axios'
const url= "https://quickpollbackend.onrender.com"

export const signup= async(data)=>{
    try
    {

        const res= await axios.post(`${url}/signup`,{data});
        return res;

    }catch(error)
    {
        return error
    }
}
export const login= async(data)=>{
    try
    {

        const res= await axios.post(`${url}/login`,{data});
        return res;

    }catch(error)
    {
        return error
    }
}

export const getUser = async (id) => {
  const token = localStorage.getItem('token'); // Get token from storage
  
  try {
    const response = await axios.post(
      `${url}/getUser`,
      { id }, // Request body
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response;
  } catch (error) {
    
    return error;
  }
}
export const addPoll = async (data) => {
  const token = localStorage.getItem('token'); // Get token from storage
  
  try {
    const response = await axios.post(
      `${url}/createpoll`,
      { data }, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response;
  } catch (error) {
    
    return error;
  }
}

export const getpolls = async (id) => {
  const token = localStorage.getItem('token'); // Get token from storage
  
  try {
    const response = await axios.post(
      `${url}/getpolls`,
      { id }, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response;
  } catch (error) {
    
    return error;
  }
}
export const getAllpolls = async () => {
  const token = localStorage.getItem('token'); // Get token from storage
  
  try {
    const response = await axios.post(
      `${url}/getallpolls`,
      {  }, 
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response;
  } catch (error) {
    
    return error;
  }
}