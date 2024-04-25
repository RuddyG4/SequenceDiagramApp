<template>
  <RouterView
    v-if="isDashboardView"
    :user="user"
  />
  <div v-else class="min-h-screen bg-gray-50/50">
    <SidebarMenu />
    <div class="p-4 xl:ml-80">
      <RouterView :user="user" />
      <Footer />
    </div>
  </div>
</template>

<script setup>
import SidebarMenu from "@/views/layouts/SidebarMenu.vue";
import Footer from "@/views/layouts/Footer.vue";
import { useRoute } from "vue-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, computed } from "vue";

const route = useRoute();
const user = ref({});

const isDashboardView = computed(() => {
  return route.name === "SignIn" || route.name === "register" || route.name === "projects";
});

onAuthStateChanged(getAuth(), (userData) => {
  if (userData) {
    user.value = userData;
    console.log("User is signed in");
  } else {
    // User is signed out
    console.log("User is signed out");
  }
});
</script>
