<template>
  <div>
    <h1>Productos</h1>
    <Toast />
    <div class="toolbar">
      <InputText v-model="searchQuery" placeholder="Buscar" />
      <NuevoProducto @productoAdded="fetchProducts" class="nuevo-producto-btn" />
    </div>
    <DataTable :value="paginatedProducts" paginator showGridlines  :rows="itemsPerPage" :totalRecords="totalRecords" @page="onPage"
      :lazy="true" :first="first">
      <Column field="name" style="width: 30%;">
        <template #header>
          <a @click="sort('id')">
            Producto
            <i :class="sortDirection === 'asc' && sortField === 'name' ? 'fa fa-sort-asc' : 'fa fa-sort'"></i>
          </a>
        </template>
        <template #body="slotProps">{{ slotProps.data.name }}</template>
      </Column>
      <Column header="Sucursales y Precios" style="width: 55%;">
        <template #body="slotProps">
          <ul>
            <li v-for="branch in slotProps.data.priceBranchOfficeProducts" :key="branch.id">
              {{ branch.branchOffice.name }}: {{ branch.price }} Bs
            </li>
          </ul>
        </template>
      </Column>
      <Column header="Acciones" style="width: 15%;">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" class="p-button-warning p-button-sm" style="margin-right: 10px;"
            @click="openEditDialog(slotProps.data)" />
          <Button icon="pi pi-trash" class="p-button-danger p-button-sm" @click="confirmDelete(slotProps.data)" />
        </template>
      </Column>
    </DataTable>
    <EditarProducto v-if="showEditDialog" :productToEdit="selectedProduct" @productUpdated="onProductUpdated"
      @closeDialog="closeEditDialog" />

    <!-- Dialogo de confirmación de eliminación -->
    <Dialog header="Confirmar Eliminación" v-model:visible="showDeleteDialog" :modal="true" :closable="false">
      <p>¿Estás seguro de que deseas eliminar este producto?</p>
      <div class="p-d-flex p-jc-end">
        <Button label="No" icon="pi pi-times" class="p-button-text" @click="showDeleteDialog = false" />
        <Button label="Sí" icon="pi pi-check" class="p-button-danger" @click="deleteProduct" />
      </div>
    </Dialog>
  </div>
</template>


<script>
import axios from 'axios'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import NuevoProducto from './NuevoProducto.vue'
import EditarProducto from './EditarProducto.vue'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'
import { filterProducts, paginatedProducts, totalRecords, fetchProducts, getUniqueBranchOffices }from './utils'

export default {
  name: 'MostrarProductos 2',
  components: {
    InputText,
    DataTable,
    Column,
    Button,
    Toast,
    NuevoProducto,
    EditarProducto,
    Dialog
  },
  setup() {
    const toast = useToast()
    return {
      toast
    }
  },
  data() {
    return {
      listarDatos: [],
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 12,
      first: 0,
      selectedProduct: null,
      showEditDialog: false,
      showDeleteDialog: false,
      productToDelete: null,
      sortField: 'id',
      sortDirection: 'desc'
    }
  },
  computed: {
    
    filterProducts() {
      return filterProducts(this.listarDatos, this.searchQuery, this.sortData)
    },
    paginatedProducts() {
      return paginatedProducts(this.filterProducts, this.first, this.itemsPerPage)
    },
    totalRecords() {
      return totalRecords(this.filterProducts)
    }
  },
    
  mounted() {
    this.fetchProducts()
  },
  methods: {
    async fetchProducts() {
      try {
        this.listarDatos = await fetchProducts()
        this.branchOffices = getUniqueBranchOffices(this.listarDatos)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    },
    confirmDelete(product) {
      this.productToDelete = product
      this.showDeleteDialog = true
    },
    deleteProduct() {
      if (!this.productToDelete) return

      axios.delete(`http://localhost:3000/products/${this.productToDelete.id}`)
        .then(response => {
          this.toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Producto eliminado',
            life: 3000
          })
          this.listarDatos = this.listarDatos.filter(product => product.id !== this.productToDelete.id)
          this.showDeleteDialog = false
          this.productToDelete = null
        })
        .catch(error => {
          console.error('Error deleting product:', error)
          this.toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el producto',
            life: 3000
          })
          this.showDeleteDialog = false
          this.productToDelete = null
        })
    },
    onPage(event) {
      this.first = event.first
    },
    sort(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortField = field
        this.sortDirection = 'asc'
      }
    },
    sortData(data) {
      if (!Array.isArray(data)) {
        console.error('Data is not an array:', data)
        return []
      }
      return data.slice().sort((a, b) => {
        if (a[this.sortField] < b[this.sortField]) return this.sortDirection === 'asc' ? -1 : 1
        if (a[this.sortField] > b[this.sortField]) return this.sortDirection === 'asc' ? 1 : -1
        return 0
      })
    },
    openEditDialog(product) {
      this.selectedProduct = JSON.parse(JSON.stringify(product)) // Crea una copia profunda
      this.showEditDialog = true
    },
    closeEditDialog() {
      this.showEditDialog = false
      this.selectedProduct = null
    },
    onProductUpdated() {
      this.fetchProducts()
      this.closeEditDialog();
    }
  },
  watch: {
    searchQuery() {
      this.currentPage = 1
      this.first = 0
    }
  }
}
</script>
