<template>
    <div>

    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "Maintenance",
    data(){return{
        departments: []
    }},
    methods: {
        async loadDepartments(){
            await axios.get("http://127.0.0.1:8000/api/department/",
            {
            headers: { Accept: "application/json" },
            timeout: 1000 * 5,
          }).then((response)=>{
              this.departments = response.data;
          })
        }
    },
    mounted() {
        this.loadDepartments();
    }
}
</script>