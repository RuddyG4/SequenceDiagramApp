<template>
  <h1 class="font-bold text-2xl">User profile</h1>

  <div class="mt-8">
    <div class="flex-1 flex flex-col gap-6">
        <div>
          <FwbInput placeholder="Email" label="Email" v-model="email" disabled />
        </div>

      <div>
        <FwbInput placeholder="Username" label="Username" v-model="username" />
      </div>
      
      <div>
        <FwbInput placeholder="Photo url" label="Photo url" v-model="photoUrl" />
      </div>

      <div>
        <FwbInput
          placeholder="0000000000"
          type="number"
          label="Phone number"
          v-model="phoneNumber"
        />
      </div>

      <div>
        <h3 class="font-semibold text-sm mb-2">Profile picture</h3>
        <FwbFileInput v-model="username" label="Profile picture" dropzone />
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-4">
      <RouterLink :to="{ name: 'home' }">
        <FwbButton color="light">Cancel</FwbButton>
      </RouterLink>
      <FwbButton @click="updateUserProfile">Update profile</FwbButton>
    </div>
  </div>
</template>

<script setup>
import { FwbInput, FwbFileInput, FwbButton } from "flowbite-vue";
import { getAuth, updateProfile, onAuthStateChanged } from "firebase/auth";
import { ref } from "vue";

const auth = getAuth();
const user = ref(null);
const username = ref("");
const phoneNumber = ref("");
const email = ref("");
const photoUrl = ref("");
const file = ref(null);

onAuthStateChanged(auth, (user) => {
  if (user) {
    user.value = user;
    username.value = user.displayName;
    phoneNumber.value = user.phoneNumber;
    email.value = user.email;
    photoUrl.value = user.photoURL;
    console.log(user.value);
  } else {
    // User is signed out
    // ...
  }
});

const updateUserProfile = () => {
  updateProfile(auth.currentUser, {
    displayName: username.value,
    phoneNumber: phoneNumber.value,
    photoURL: photoUrl.value,
  }).then(() => {
    console.log("Profile updated successfully");
  });
};
</script>
