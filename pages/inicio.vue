<script lang="ts" setup>
import { ref, onMounted } from 'vue';

// Interfaz de Personajes
export interface Character {
  id?: number; // Opcional (para los que no vienen de la API)
  name: string;
  image: string;
  gender?: string;
  species?: string;
  status?: string;
  origin?: { name: string };
}

// Estado global
const allCharacters = ref<Character[]>([]);
const newCharacter = ref<Character>({
  name: "",
  image: "",
  gender: "",
  species: "",
  status: "",
  origin: { name: "" }
});
const editingIndex = ref<number | null>(null);
const dialog = ref(false);
const detailsVisible = ref<boolean[]>([]);

// 🔥 Lista de IDs de personajes de la API que se han eliminado
const deletedIds = ref<number[]>([]);

// 1) Cargar datos iniciales
onMounted(() => {
  // 🔥 Recuperar deletedIds de LocalStorage
  const storedDeletedIds = JSON.parse(localStorage.getItem("deletedIds") || "[]");
  deletedIds.value = storedDeletedIds;

  fetchCharacters();
});

// 2) Traer personajes de la API y fusionar con LocalStorage
const fetchCharacters = async () => {
  const response = await fetch("https://rickandmortyapi.com/api/character");
  const apiCharacters = (await response.json()).results.slice(0, 20);

  // Personajes agregados/ editados
  const storedCharacters = JSON.parse(localStorage.getItem("characters") || "[]");

  // Fusionar
  allCharacters.value = mergeCharacters(apiCharacters, storedCharacters);
  detailsVisible.value = allCharacters.value.map(() => false);

  saveCharacters();
};

// 3) Fusionar API + LocalStorage ignorando IDs eliminados
const mergeCharacters = (apiCharacters: Character[], storedCharacters: Character[]) => {
  // Filtrar personajes de la API que NO estén en deletedIds
  const filteredApiChars = apiCharacters.filter(apiChar => {
    return !deletedIds.value.includes(apiChar.id ?? -1); 
  });

  // Reemplazar personajes de la API por los editados en localStorage (si coinciden IDs)
  const updatedApiChars = filteredApiChars.map(apiChar => {
    const editedChar = storedCharacters.find(c => c.id === apiChar.id);
    return editedChar ? editedChar : apiChar;
  });

  // Agregar los personajes personalizados (sin ID)
  const customChars = storedCharacters.filter(c => !c.id);

  // Combinar todo
  return [...updatedApiChars, ...customChars];
};

// 4) Guardar lista principal en LocalStorage
const saveCharacters = () => {
  localStorage.setItem("characters", JSON.stringify(allCharacters.value));
};

// 5) Modal: Agregar un personaje nuevo
const openAddModal = () => {
  newCharacter.value = {
    name: "",
    image: "",
    gender: "",
    species: "",
    status: "",
    origin: { name: "" }
  };
  editingIndex.value = null;
  dialog.value = true;
};

// 6) Modal: Editar un personaje existente
const openEditModal = (index: number) => {
  newCharacter.value = { ...allCharacters.value[index] };
  if (!newCharacter.value.origin) {
    newCharacter.value.origin = { name: "" };
  }
  editingIndex.value = index;
  dialog.value = true;
};

// 7) Guardar cambios de personaje (nuevo o editado)
const saveCharacter = () => {
  if (!newCharacter.value.name || !newCharacter.value.image) return;

  if (editingIndex.value !== null) {
    // Editar personaje
    allCharacters.value[editingIndex.value] = { ...newCharacter.value };
  } else {
    // Agregar nuevo personaje
    allCharacters.value.push({ ...newCharacter.value });
  }

  saveCharacters();
  dialog.value = false;
};

// 8) Eliminar personaje (API o personalizado)
const deleteCharacter = (index: number) => {
  const character = allCharacters.value[index];

  // 🔥 Si tiene ID (API), guardamos su ID en deletedIds para que no reaparezca
  if (character.id) {
    deletedIds.value.push(character.id);
    localStorage.setItem("deletedIds", JSON.stringify(deletedIds.value));
  }

  // Eliminar del arreglo principal
  allCharacters.value.splice(index, 1);
  saveCharacters();
};

// 9) Mostrar/ocultar detalles
const toggleDetails = (index: number) => {
  detailsVisible.value[index] = !detailsVisible.value[index];
};
</script>

<template>
  <v-container fluid>
    <!-- Header -->
    <v-row justify="space-between" align="center" class="mb-4">
      <v-col>
        <h2>Gestión de Personajes</h2>
      </v-col>
      <v-col class="text-right">
        <v-btn color="primary" @click="openAddModal">+ Agregar Personaje</v-btn>
      </v-col>
    </v-row>

    <v-divider></v-divider>

    <!-- Lista de personajes -->
    <v-row>
      <v-col
        v-for="(item, index) in allCharacters"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="custom-card">
          <!-- Imagen más pequeña -->
          <v-img height="200px" :src="item.image" cover></v-img>

          <v-card-title>{{ item.name }}</v-card-title>
          <v-card-subtitle>
            {{ item.id ? "Personaje de la API" : "Personaje agregado" }}
          </v-card-subtitle>

          <v-card-actions>
            <v-btn color="blue" @click="openEditModal(index)">Editar</v-btn>
            <v-btn color="red" @click="deleteCharacter(index)">
              <v-icon>mdi-trash-can-outline</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn icon @click="toggleDetails(index)">
              <v-icon>{{ detailsVisible[index] ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </v-card-actions>

          <!-- Sección de detalles -->
          <v-expand-transition>
            <div v-show="detailsVisible[index]" class="details">
              <v-divider></v-divider>
              <p><strong>Género:</strong> {{ item.gender || 'Desconocido' }}</p>
              <p><strong>Especie:</strong> {{ item.species || 'Desconocido' }}</p>
              <p><strong>Estado:</strong> {{ item.status || 'Desconocido' }}</p>
              <p><strong>Origen:</strong> {{ item.origin?.name || 'Desconocido' }}</p>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal para Agregar/Editar Personajes -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editingIndex !== null ? "Editar Personaje" : "Agregar Personaje" }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newCharacter.name"
            label="Nombre del personaje"
          ></v-text-field>
          <v-text-field
            v-model="newCharacter.image"
            label="URL de la imagen"
          ></v-text-field>
          <v-text-field
            v-model="newCharacter.gender"
            label="Género"
          ></v-text-field>
          <v-text-field
            v-model="newCharacter.species"
            label="Especie"
          ></v-text-field>
          <v-text-field
            v-model="newCharacter.status"
            label="Estado"
          ></v-text-field>
          <v-text-field
            v-model="newCharacter.origin.name"
            label="Origen"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue" @click="saveCharacter">
            {{ editingIndex !== null ? "Actualizar" : "Guardar" }}
          </v-btn>
          <v-btn color="red" @click="dialog = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.custom-card {
  margin-bottom: 20px;
  padding: 8px;
  border-radius: 8px;
}

.details {
  padding: 10px;
}

.v-btn {
  margin-right: 5px;
}
</style>
