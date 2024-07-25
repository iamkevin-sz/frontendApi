<template>
  <div>
    <h1>Sucursales</h1>
    <Toast />
    <div class="toolbar">
      <InputText v-model="searchQuery" placeholder="Buscar" />
      <NuevaSucursal @sucursalAdded="fetchSucursales" class="nuevo-sucursal-btn" />
    </div>
    <DataTable :value="paginatedSucursales" paginator :rows="itemsPerPage" :totalRecords="totalRecords" @page="onPage"
      :lazy="true" :first="first">
      <Column field="name" style="width: 45%;">
        <template #header>
          <a @click="sort('name')">
            Sucursal
            <i :class="sortDirection === 'asc' && sortField === 'name' ? 'fa fa-sort-asc' : 'fa fa-sort'"></i>
          </a>
        </template>
        <template #body="slotProps">{{ slotProps.data.name }}</template>
      </Column>
      <Column field="location" style="width: 40%;">
        <template #header>Localización</template>
        <template #body="slotProps">{{ slotProps.data.location }}</template>
      </Column>
      <Column header="Acciones" style="width: 15%;">
        <template #body="slotProps">
          <Button @click="openEditDialog(slotProps.data)" icon="pi pi-pencil" class="p-button-warning p-button-sm" style="margin-right: 10px;" />
          <Button @click="deleteSucursal(slotProps.data.id)" icon="pi pi-trash" class="p-button-danger p-button-sm" />
        </template>
      </Column>
    </DataTable>
    <EditarSucursales v-if="selectedSucursal" :sucursalData="selectedSucursal" @sucursalUpdated="fetchSucursales"
      @closeDialog="selectedSucursal = null" />
  </div>
</template>

<script>
import axios from 'axios'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import NuevaSucursal from './NuevaSucursal.vue'
import EditarSucursales from './EditarSucursales.vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

export default {
  name: 'MostrarSucursales',
  //componentes que este componente mostrar usara
  components: {
    InputText,
    DataTable,
    Column,
    Button,
    NuevaSucursal,
    EditarSucursales,
    Toast
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
      itemsPerPage: 10,
      first: 0,
      selectedSucursal: null,
      sortField: 'name',
      sortDirection: 'asc'
    }
  },
  computed: {
    filteredSucursales() {
      let data = this.listarDatos
      if (this.searchQuery) {
        data = data.filter(sucursal =>
          sucursal.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      return this.sortData(data)
    },
    paginatedSucursales() {
      const start = this.first
      const end = start + this.itemsPerPage
      return this.filteredSucursales.slice(start, end)
    },
    totalRecords() {
      return this.filteredSucursales.length
    }
  },
  mounted() {
    this.fetchSucursales()
  },
  methods: {
    fetchSucursales() {
      axios.get('http://localhost:3000/branch-office')
        .then(response => {
          this.listarDatos = response.data
        })
        .catch(error => {
          console.error('Error fetching data:', error)
        })
    },
    deleteSucursal(id) {
      axios.delete(`http://localhost:3000/branch-office/${id}`)
        .then(response => {
          this.toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Sucursal eliminada',
            life: 3000 // 3 segundos
          })
          this.listarDatos = this.listarDatos.filter(sucursal => sucursal.id !== id)
        })
        .catch(error => {
          console.error('Error deleting sucursal:', error)
          this.toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar la sucursal debido a que se le asigno productos',
            life: 3000 // 3 segundos
          })
        })
    },
    openEditDialog(sucursal) {
      this.selectedSucursal = sucursal
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
      return data.slice().sort((a, b) => {
        if (a[this.sortField] < b[this.sortField]) return this.sortDirection === 'asc' ? -1 : 1
        if (a[this.sortField] > b[this.sortField]) return this.sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }
  },
  watch: {
    searchQuery() {
      this.currentPage = 1 // Reset to first page on search
      this.first = 0 // Reset the starting index
    }
  }
}
</script>

<style scoped>
h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #10b981;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.nuevo-sucursal-btn {
  margin-left: auto; 
}

.p-button-sm {
  padding: 0.25rem 0.5rem;
}

.p-button-danger,
.p-button-warning {
  margin-right: 10px;
}
</style>
