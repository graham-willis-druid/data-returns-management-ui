// ---------------------------------------------------------------------------------------
// Remote Data Example

isc.DynamicForm.create({
    top: 25,
    width: 500,
    numCols: 4,
    autoDraw: true,
    fields: [
        {name:"categoryName", title:"Category", editorType:"select", 
         optionDataSource:"supplyCategory", changed:"form.clearValue('itemName');" 
        },
        {name: "itemName", title:"Item", editorType: "select", 
         optionDataSource:"supplyItem", 
         getPickListFilterCriteria : function () {
            var category = this.form.getValue("categoryName");
            return {category:category};
         }
        }
    ]
});
