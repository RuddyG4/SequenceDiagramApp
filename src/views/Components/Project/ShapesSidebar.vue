<template>
    <div
    class="mx-4 p-4 absolute bg-white z-10 top-1/2 -translate-y-1/2 rounded border border-slate-400"
  >
    <div class="flex gap-x-4 items-center">
      <div>
        <i class="fa-solid fa-magnifying-glass"></i>
      </div>
      <div>
        <input
          type="text"
          class="px-2 py-1 rounded border-slate-400 focus:outline-none focus:ring focus:ring-slate-300"
          name="search_shapes"
          id="search_shapes"
          placeholder="Search shapes..."
        />
      </div>
    </div>
    <div class="mt-4">
      <div>
        <div>
          <button type="button">
            <i class="fa-solid fa-caret-right mr-2"></i>
            <h4 class="inline">Standard Shapes</h4>
          </button>
        </div>
        <div class="grid grid-cols-4 gap-2 pt-2">
          <ShapeButton @click="$emit('addNewShape', 'circle')">
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="15" stroke="blue" fill="none" />
            </svg>
          </ShapeButton>
          <ShapeButton @click="$emit('addNewShape', 'rectangle')">
            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
              <rect
                x="5"
                y="5"
                width="28"
                height="28"
                stroke="blue"
                fill="none"
              />
            </svg>
          </ShapeButton>
          <ShapeButton @click="$emit('addNewLink', 'link')">
            <svg height="40" width="40" xmlns="http://www.w3.org/2000/svg">
              <line x1="0" y1="30" x2="35" y2="5" stroke="blue" />
            </svg>
          </ShapeButton>
          <ShapeButton @click="$emit('addNewShape', 'actor')">
            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="8" r="5" stroke="blue" fill="none" />
              <line x1="16" y1="13" x2="16" y2="26" stroke="blue" />
              <line x1="11" y1="20" x2="21" y2="20" stroke="blue" />
              <line x1="16" y1="26" x2="11" y2="32" stroke="blue" />
              <line x1="16" y1="26" x2="21" y2="32" stroke="blue" />
            </svg>
          </ShapeButton>
          <ShapeButton @click="$emit('addNewShape', 'object')">
            <svg height="32" width="40" xmlns="http://www.w3.org/2000/svg">
              <polygon
                points="2,2 38,2 38,30 2,30"
                style="fill: none; stroke: blue; stroke-width: 1"
              />
              <text x="5" y="18" fill="blue" font-size="10">Object</text>
            </svg>
          </ShapeButton>
          <ShapeButton @click="$emit('addNewShape', 'activationBox')">
            <svg height="32" width="32" xmlns="http://www.w3.org/2000/svg">
              <rect
                x="13"
                y="4"
                width="6"
                height="28"
                stroke="blue"
                fill="none"
              />
            </svg>
          </ShapeButton>
          <ShapeButton @click="$emit('addNewShape', 'alternativeBox')">
            <svg height="32" width="40" xmlns="http://www.w3.org/2000/svg">
              <polygon
                points="2,2 38,2 38,30 2,30 2,2"
                style="fill: none; stroke: blue; stroke-width: 1"
              />
              <line x1="2" y1="10" x2="16" y2="10" stroke="blue" />
              <line x1="16" y1="10" x2="20" y2="8" stroke="blue" />
              <line x1="20" y1="8" x2="20" y2="2" stroke="blue" />
              <text x="6" y="8" fill="blue" font-size="6">Alt</text>
            </svg>
          </ShapeButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ShapeButton from './ShapeButton.vue';

defineEmits(["addNewShape", "addNewLink"]);
</script>