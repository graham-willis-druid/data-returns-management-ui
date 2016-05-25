
isc.ListGrid.create({
    ID: "worldList",
    width:750, height:224, alternateRecordStyles:true, 
    dataSource: worldDS,
    autoFetchData: true,
    showFilterEditor: true,
    canEdit: true,
    editEvent: "click",
    canRemoveRecords: true,
    fields: [
        { name:"countryCode", title:"Code", width:50 },
        { name:"countryName", title:"Country" },
        { name:"capital", title:"Capital" },
        { name:"government", title:"Government" },
        { name:"continent", title:"Continent" },
        { name:"independence", title:"Nationhood" },
        { name:"area", title:"Area (km&amp;sup2;)" },
        { name:"population", title:"Population", width: 100 },
        { name:"gdp", title:"GDP ($M)", width: 80 }
    ]
});

isc.Button.create({
    ID: "newButton",
    top: 230,
    title: "Add New",
    click: "worldList.startEditingNew();"
});
