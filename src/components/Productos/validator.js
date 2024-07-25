import axios from 'axios';

export const uniqueProductName = async (value) => {
  if (!value) return true;
  try {
    await axios.post('http://localhost:3000/products/validate-name', { name: value });
    return true; // Nombre es único
  } catch (error) {
    return false; // Nombre ya existe
  }
};
