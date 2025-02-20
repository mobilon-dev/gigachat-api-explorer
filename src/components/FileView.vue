<script setup lang="ts">
import { inject, onMounted, ref } from 'vue';
import { ApiClient } from '../api-client/ApiClient';
import { useContentStore } from '../store/contentStore';

const contentStore = useContentStore()
const apiClient = inject('apiClient') as ApiClient
const files = ref()
const selectedFile = ref<any>(null)
const fileInput = ref<HTMLInputElement>()
const openFileInfo = ref(false)
const fileInfo = ref<any>(null)
const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const onFileSelected = async () => {
  if (fileInput.value?.files){
    console.log(fileInput.value.files[0])
    const _30mb = 3145280
    const _15mb = 15728640
    const type = fileInput.value.files[0].type
    const size = fileInput.value.files[0].size
    if ((type.indexOf('image') != -1 && size < _15mb) || size < _30mb){
      await apiClient.uploadFile(fileInput.value?.files[0])
      contentStore.setFiles(await apiClient.getFileList())
      files.value = contentStore.files
    }
    else alert('На загружаемые файлы действует ограничение: изображение не более 15Мб, документ не более 30Мб')
  }
};

const selectFile = (file) => {
  files.value.data.forEach((f) => {
    f.selected = false
    if (f == file){
      f.selected = true
      selectedFile.value = f
    }
  })
}

const deleteFile = async () => {
  if (selectedFile.value){
    await apiClient.deleteFile(selectedFile.value.id)
    contentStore.setFiles(await apiClient.getFileList())
    files.value = contentStore.files
  }
}

const downloadFile = async () => {
  if (selectedFile.value){
    await apiClient.downloadFile(selectedFile.value.id, selectedFile.value.filename, selectedFile.value.created_at)
  }
}

const aboutFile = async () => {
  if (selectedFile.value){
    contentStore.isLoading = true
    const response = await apiClient.getFileInfo(selectedFile.value.id)
    contentStore.isLoading = false
    fileInfo.value = response
    openFileInfo.value = true
  }
}

onMounted(async () => {
  files.value = contentStore.files
  console.log(files.value)
})
</script>

<template>
  <div class="container">
    <button 
      class="btn btn-warning"
      @click="triggerFileUpload"
    >
      Загрузить файл
    </button>
    <input
      ref="fileInput"
      style="display: none;"
      type="file"
      @change="onFileSelected"
      accept=".txt,.doc,.docx,.pdf,.jpg,.png,.tiff,.bmp"
    >
    <div v-if="files">
      <div class="fileview__table" v-if="files.data.length > 0">
        <div class="fileview__row">
          <strong>Наименование</strong>
          <strong>Размер</strong>
          <strong>Создан</strong>
        </div>
        
        <div 
          v-for="file of files.data"
          class="fileview__row fileview__file" 
          :class="{'fileview__selected-file' : file.selected}"
          @click="selectFile(file)"
        >
          <div class="fileview__col1">{{ file.filename }}</div>
          <div class="fileview__col2">{{ file.bytes }}</div>
          <div class="fileview__col3">{{ file.created_at }}</div>
        </div>
      </div>
      <p v-else>Список файлов пуст</p>
    </div>
    
    <div class="fileview__file-controls">
      <button 
        class="btn btn-secondary"
        v-if="selectedFile"
        @click="deleteFile"
      >
        Удалить файл
      </button>
      <button 
        class="btn btn-secondary"
        v-if="selectedFile"
        @click="downloadFile"
      >
        Скачать файл
      </button>
      <button 
        class="btn btn-secondary"
        v-if="selectedFile"
        @click="aboutFile"
      >
        О файле
      </button>
    </div>
    
    <Teleport to="body">
      <div
        v-if="openFileInfo"
        class="fileview__modal-overlay"
      >
        <div class="fileview__modal modal-content rounded-4 shadow">
          <div class="modal-header border-bottom-0">
            <h1 class="modal-title fs-5">О файле</h1>
            <button
              class="btn-close"
              @click="openFileInfo = false"
            >
            </button>
          </div>
          <div class="fileview__modal-table">
            <div style="width: 35%;" class="fileview__modal-first-col">
            <strong>Политика доступа: </strong>
            <strong>Размер в байтах: </strong>
            <strong>Создан/timestamp: </strong>
            <strong>Название файла: </strong>
            <strong>Идентификатор: </strong>
            <strong>Тип: </strong>
            <strong>Назначение: </strong>
          </div>
          <div style="width: 65%;">
            <p>{{ fileInfo?.access_policy }}</p>
            <p>{{ fileInfo?.bytes }}</p>
            <p>{{ fileInfo?.created_at }}</p>
            <p>{{ fileInfo?.filename }}</p>
            <p>{{ fileInfo?.id }}</p>
            <p>{{ fileInfo?.object }}</p>
            <p>{{ fileInfo?.purpose }}</p>
          </div>
          </div>
          
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
  .fileview{
    &__table{
      display: flex;
      flex-direction: column;
    }

    &__row{
      display: grid;
      border-bottom: 1px solid var(--bs-border-color);
      grid-column: 1/3;
      grid-template-columns: 60% 15% 25%;
      padding: 7px;
    }

    &__file{
      cursor: pointer;
    }

    &__col1{
      grid-column: 1;
    }

    &__col2{
      grid-column: 2;
      font-size: 12px;
    }
    &__col3{
      grid-column: 3;
      font-size: 12px;
    }

    &__selected-file{
      background-color: var(--bs-secondary-bg);
    }

    &__file-controls{
      display: flex;
      gap: 5px;
      margin-top: 5px;
    }

    &__modal {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 101;
      background-color: white;
      border-radius: 5px;
      padding: 10px;
      width: 500px;
    }

    &__modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.5);
      z-index: 1000;
    }

    &__modal-table{
      display: flex;
    }

    &__modal-first-col{
      strong{
        display: block;
        width: 100%;
        margin-bottom: 1rem
      }
    }
  }
</style>
