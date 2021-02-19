<template>
	<sui-table celled striped>
    <sui-table-header>
    	<sui-table-row>
        <sui-table-header-cell :colspan="1">
        	{{ table_title }}
        </sui-table-header-cell>
    	</sui-table-row>
    	<sui-table-row>
        <sui-table-header-cell colspan="1">
        	Name
        </sui-table-header-cell>
    	</sui-table-row>
    </sui-table-header>
    <sui-table-body>
    	<sui-table-row v-for="student in students">
    		<sui-table-cell>
    			{{ student }}
    		</sui-table-cell>
    	</sui-table-row>
    </sui-table-body>
	</sui-table>
</template>

<script>
export default {
  name: 'StudentPercentileTable',
  props: {
  	table_title: {
  		type: String,
  		required: true
  	},
  	students: {
  		type: Array,
  		required: true
  	}
  }
}
</script>