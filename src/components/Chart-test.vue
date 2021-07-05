<template>
<div>
  <apexchart
    height="300"
    type="line"
    :ref="refers"
    :options="options"
    :series="series"
  >
  </apexchart>
</div>
</template>

<script>
export default {
  name: "Chart",
  props:{
        refers:{type: String},
        options: {
            type: Object,
            default: null,
        },
        series: {
            type: Array,
            default: null,
        }},
  
};
</script>
