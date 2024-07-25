import axios from "axios";
const API_BASE_URL = "http://localhost:3000";
//cargamos datos de sucursales
export const fetchSucursales = async (sucursales, toast) => {
  try {
    const response = await axios.get("http://localhost:3000/branch-office");
    sucursales.value = response.data;
    console.log("Fetching sucursales...", sucursales.value);
  } catch (error) {
    console.error("Error fetching sucursales:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudieron cargar las sucursales",
      life: 3000,
    });
  }
};
//inicializamos selectedSucursales es decir pasamos las sucursales que tiene el producto a selectedSucursales
export const initializeSelectedSucursales = (
  productToEdit,
  sucursales,
  selectedSucursales,
  sucursalPrices
) => {
  if (productToEdit && productToEdit.priceBranchOfficeProducts) {
    selectedSucursales.value = productToEdit.priceBranchOfficeProducts
      .map((pbop) => {
        const sucursal = sucursales.value.find(
          (s) => s.id === pbop.branchOffice.id
        );
        if (sucursal && pbop.price) {
          sucursalPrices[sucursal.id] = parseFloat(pbop.price);
        }
        return sucursal;
      })
      .filter(Boolean);
  }
};
//actualiza el estado de sucursalPrices en base a selectedSucursales
export const handleSucursalChange = (selectedSucursales, sucursalPrices) => {
  selectedSucursales.value.forEach((sucursal) => {
    if (!sucursalPrices[sucursal.id]) {
      sucursalPrices[sucursal.id] = null;
    }
  });
};

//aplicar precio global
export const applyGlobalPrice = (price, selectedSucursales, sucursalPrices) => {
  if (!selectedSucursales || !sucursalPrices) {
    console.error("selectedSucursales or sucursalPrices is not defined");
    return;
  }

  selectedSucursales.value.forEach((sucursal) => {
    sucursalPrices[sucursal.id] = price;
  });
};

// Validar precios
export const validatePrices = (selectedSucursales, sucursalPrices) => {
  return selectedSucursales.value.every(
    (sucursal) =>
      sucursalPrices[sucursal.id] !== null &&
      sucursalPrices[sucursal.id] !== undefined
  );
};

// borrar sucursal y precio de la ventana modal
export const removeSucursal = (
  id,
  selectedSucursales,
  sucursalesToDelete,
  sucursalPrices
) => {
  selectedSucursales.value = selectedSucursales.value.filter(
    (sucursal) => sucursal.id !== id
  );
  sucursalesToDelete.value.push(id);
  delete sucursalPrices[id];
};

// Actualizar producto
export const updateProducto = async ({
  $v,
  editedProducto,
  selectedSucursales,
  sucursalPrices,
  showDialog,
  toast,
  emit,
  props,
}) => {
  $v.value.$touch();
  if (
    $v.value.$invalid ||
    !validatePrices(selectedSucursales, sucursalPrices)
  ) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Por favor complete el formulario correctamente",
      life: 3000,
    });
    return;
  }

  try {
    console.log("Product ID:", editedProducto.value.id); // <-- Añadido para verificar el ID del producto
    const productData = {
      name: editedProducto.value.name,
      priceBranchOfficeProducts: selectedSucursales.value.map((sucursal) => {
        // Encuentra el ID si ya existe en la lista de sucursales
        const existingProduct =
          props.productToEdit.priceBranchOfficeProducts.find(
            (pbop) => pbop.branchOffice.id === sucursal.id
          );
        return {
          id: existingProduct ? existingProduct.id : undefined, // Incluye el ID si existe
          branch_office_id: sucursal.id,
          price: sucursalPrices[sucursal.id],
          // product_id: editedProducto.value.id // Incluye el ID del producto
        };
      }),
      branchOfficesToDelete: props.productToEdit.priceBranchOfficeProducts
        .filter(
          (pbop) =>
            !selectedSucursales.value.some(
              (sucursal) => sucursal.id === pbop.branchOffice.id
            )
        )
        .map((pbop) => pbop.id),
    };
    console.log("Product Data to Send:", productData); // <-- Añadido para verificar los datos
    await axios.patch(
      `http://localhost:3000/products/${editedProducto.value.id}`,
      productData
    );
    showDialog.value = false;
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Producto actualizado",
      life: 3000,
    });
    emit("productUpdated");
    emit("closeDialog");
  } catch (error) {
    console.error("Error updating producto:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Error al actualizar el producto",
      life: 3000,
    });
  }
};

// agregar producto

export const addProducto = async ({
  $v,
  newProducto,
  selectedSucursales,
  sucursalPrices,
  globalPrice,
  showDialog,
  toast,
  emit,
}) => {
  $v.value.$touch();
  if (
    $v.value.$invalid ||
    !validatePrices(selectedSucursales, sucursalPrices)
  ) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Por favor complete el formulario correctamente",
      life: 3000, // 3 segundos
    });
    return;
  }

  try {
    const productData = {
      name: newProducto.value.name,
      priceBranchOfficeProducts: selectedSucursales.value.map((sucursal) => ({
        branch_office_id: sucursal.id,
        price: sucursalPrices[sucursal.id],
      })),
    };
    await axios.post("http://localhost:3000/products", productData);
    newProducto.value = { name: "" };
    selectedSucursales.value = [];
    Object.keys(sucursalPrices).forEach((key) => {
      sucursalPrices[key] = null;
    });
    globalPrice.value = null;
    showDialog.value = false;
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Producto guardado",
      life: 3000, // 3 segundos
    });
    emit("productoAdded");
  } catch (error) {
    console.error("Error adding producto:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "El Producto ya existe!",
      life: 3000, // 3 segundos
    });
  }
};

//MOSTRARPRODUCTOS

//filtra los productos basados en la consulta de búsqueda y las sucursales seleccionadas.
export const filterProducts = (listarDatos, searchQuery, sortData) => {
  let data = listarDatos;
  // console.log('SON LOS DATOS TRAIDOS DE LA DATA',this.listarDatos)
  if (searchQuery) {
    data = data.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  // console.log('SON los  DATOS filtrados TRAIDOS DE LA DATA', data)
  return sortData(data);
};
// toma los productos filtrados y devuelve solo aquellos que deben mostrarse en la página actual
export const paginatedProducts = (filteredProducts, first, itemsPerPage) => {
  const start = first;
  const end = start + itemsPerPage;
  // let prueba = this.filteredProducts.slice(start, end)
  // console.log(prueba)
  return filteredProducts.slice(start, end);
};

//devuelve la cantidad total de productos filtrados
export const totalRecords = (filteredProducts) => {
  return filteredProducts.length;
};

export const fetchProducts = async () => {
  try {
    const response = await axios.get("http://localhost:3000/products");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getUniqueBranchOffices = (products) => {
  const branchOffices = new Set();
  products.forEach((product) => {
    product.priceBranchOfficeProducts.forEach((pbop) => {
      branchOffices.add(JSON.stringify(pbop.branchOffice));
    });
  });
  return Array.from(branchOffices).map((bo) => JSON.parse(bo));
};