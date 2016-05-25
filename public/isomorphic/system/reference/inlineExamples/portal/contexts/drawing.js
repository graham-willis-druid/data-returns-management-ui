// The following gradients are shared by various DrawItem shapes and are 
// applied to the empty DrawPane as well as the palette tile DrawPanes
var commonGradients = [
    { id: "oval", direction: 90, startColor: "#ffffff", endColor: "#99ccff" },
    { id: "diamond", direction: 90, startColor: "#d3d3d3", endColor: "#666699" },
    { id: "rect", direction: 90, startColor: "#f5f5f5", endColor: "#a9b3b8" },
    { id: "triangle", direction: 90, startColor: "#f5f5f5", endColor: "#667766" }
];

// Empty DrawPane palette node use when clearing edit canvas
var emptyDrawPanePaletteNode = {
    type: "DrawPane",
    defaults: {
        // The DrawPane must be focusable in order for a keypress to trigger inline editing
        // of a selected draw item whose EditProxy is configured with inlineEditEvent:"dblOrKeypress".
        canFocus: true,
        width: "100%",
        height: "100%",
        gradients: commonGradients
    }
};

// Define a class for all of the tiles in the TilePalette defined below.  Each
// tile has a DrawPane that is used to render a single DrawItem.
isc.defineClass("DrawItemTile", "SimpleTile").addProperties({
    initWidget : function () {
        this.Super("initWidget", arguments);

        this.drawPane = isc.DrawPane.create({
            autoDraw: false,
            width: "100%",
            height: "100%",
            gradients: commonGradients
        });
        this.addChild(this.drawPane);

        this.record = this.getRecord();
    },

    getInnerHTML : function () {
        // We do not want the default HTML generated by the superclass SimpleTile's
        // getInnerHTML() method to be drawn, so just return a blank HTML string here.
        return "&nbsp;";
    },

    drawRecord : function (record) {
        var tilePalette = this.creator,
            drawItem = tilePalette.makeEditNode(record).liveObject;

        if (!isc.isAn.Instance(drawItem)) {
            drawItem = isc[drawItem._constructor].create(isc.addProperties({}, drawItem, {
                autoDraw: false
            }));
        }

        this.drawPane.addDrawItem(drawItem);
    },

    draw : function () {
        var ret = this.Super("draw", arguments);
        this.drawRecord(this.getRecord());
        return ret;
    },

    redraw : function () {
        var drawPane = this.drawPane,
            record = this.getRecord();

        if (record !== this.record) {
            drawPane.erase();

            this.drawRecord(record);
            this.record = record;
        }

        return this.Super("redraw", arguments);
    }
});


isc.TilePalette.create({
    ID: "tilePalette",
    width: 270,
    tileWidth: 80,
    tileHeight: 80,
    canDragTilesOut: true,

    tileConstructor: "DrawItemTile",
    fields: [{
        name: "type"
    }, {
        name: "title",
        title: "Component"
    }],

    initWidget : function () {
        this.Super("initWidget", arguments);

        // We are supplying the component data inline for this example.
        // However, the TilePalette is a subclass of TileGrid, so you could
        // also use a dataSource.
        var data = this.generateData(this.tileWidth, this.tileHeight, 3);

        // Set default properties on the DrawItems offered in the palette.
        var defaultDrawItemProperties = {
            keepInParentRect: true,
            lineWidth: 1
        };
        for (var i = 0, len = data.length; i < len; ++i) {
            var defaults = data[i].defaults;
            if (defaults == null) {
                defaults = data[i].defaults = {};
            }
            if (data[i].type != "DrawLine" && data[i].type != "DrawCurve" && data[i].type != "DrawLinePath") {
                defaultDrawItemProperties.shadow = { color: '#333333', blur: 2, offset: [1,1] };
            }
            isc.addDefaults(defaults, defaultDrawItemProperties);
        }

        this.setData(data);
    },

    // Creates PaletteNodes for each of nine different types of DrawItems.  The
    // defaults of the nodes are set so that the shapes will fit in the grid
    // tiles.
    generateData : function (tileWidth, tileHeight, topPadding, leftPadding, rightPadding, bottomPadding) {
        if (tileHeight == null) tileHeight = tileWidth;

        if (topPadding == null) topPadding = 2;
        if (leftPadding == null) leftPadding = topPadding;
        if (rightPadding == null) rightPadding = leftPadding;
        if (bottomPadding == null) bottomPadding = topPadding;

        tileWidth -= (leftPadding + rightPadding);
        tileHeight -= (topPadding + bottomPadding);

        var xc = leftPadding + (tileWidth / 2),
            yc = topPadding + (tileHeight / 2),
            width = tileWidth - leftPadding - rightPadding,
            height = tileHeight - topPadding - bottomPadding,
            center = [Math.round(xc), Math.round(yc)],

            // variables for the DrawRect:
            smallAngle = Math.PI / 5,
            rectPoints = isc.DrawPane.getPolygonPoints(
                width, height, xc, yc,
                [smallAngle, Math.PI - smallAngle, Math.PI + smallAngle, -smallAngle]),
            rectTop = rectPoints[1][1],
            rectLeft = rectPoints[1][0],
            rectWidth = rectPoints[3][0] - rectLeft,
            rectHeight = rectPoints[3][1] - rectTop;

        // Define the default properties for three DrawCurves.
        var curveDefaults = {
                startPoint: [200, 50],
                endPoint: [300, 150],
                controlPoint1: [250, 0],
                controlPoint2: [250, 200]
            },
            oneArrowCurveDefaults = {
                endArrow: "block",
                startPoint: [200, 50],
                endPoint: [300, 150],
                controlPoint1: [250, 0],
                controlPoint2: [250, 200]
            },
            twoArrowCurveDefaults = {
                startArrow: "block",
                endArrow: "block",
                startPoint: [200, 50],
                endPoint: [300, 150],
                controlPoint1: [250, 0],
                controlPoint2: [250, 200]
            };

        // Rescale the three DrawCurves to center them at (xc, yc) and to fit them within the
        // width and height.
        isc.DrawPane.scaleAndCenterBezier(
            width, height - 20, xc, yc,
            curveDefaults.startPoint, curveDefaults.endPoint,
            curveDefaults.controlPoint1, curveDefaults.controlPoint2);
        isc.DrawPane.scaleAndCenterBezier(
            width, height - 20, xc, yc,
            oneArrowCurveDefaults.startPoint, oneArrowCurveDefaults.endPoint,
            oneArrowCurveDefaults.controlPoint1, oneArrowCurveDefaults.controlPoint2);
        isc.DrawPane.scaleAndCenterBezier(
            width, height - 20, xc, yc,
            twoArrowCurveDefaults.startPoint, twoArrowCurveDefaults.endPoint,
            twoArrowCurveDefaults.controlPoint1, twoArrowCurveDefaults.controlPoint2);

        var data = [{
            title: "Line",
            type: "DrawLine",
            defaults: {
                startPoint: [Math.round(xc - width / 2), Math.round(yc - height / 2)],
                endPoint: [Math.round(xc + width / 2), Math.round(yc + height / 2)]
            }
        }, {
            title: "Line w/arrow",
            type: "DrawLine",
            defaults: {
                startPoint: [Math.round(xc - width / 2), Math.round(yc - height / 2)],
                endPoint: [Math.round(xc + width / 2), Math.round(yc + height / 2)],
                lineWidth: 1,
                endArrow: "block"
            }
        }, {
            title: "Line w/two arrows",
            type: "DrawLine",
            defaults: {
                startPoint: [Math.round(xc - width / 2), Math.round(yc - height / 2)],
                endPoint: [Math.round(xc + width / 2), Math.round(yc + height / 2)],
                startArrow: "block",
                endArrow: "block"
            }
        }, {
            title: "Curve",
            type: "DrawCurve",
            defaults: curveDefaults
        }, {
            title: "Curve w/arrow",
            type: "DrawCurve",
            defaults: oneArrowCurveDefaults
        }, {
            title: "Curve w/two arrows",
            type: "DrawCurve",
            defaults: twoArrowCurveDefaults
        }, {
            title: "Line Path",
            type: "DrawLinePath",
            defaults: {
                startPoint: [Math.round(xc - width / 2), Math.round(yc - (height - 10) / 2)],
                endPoint: [Math.round(xc + width / 2), Math.round(yc + (height - 20) / 2)],
                endArrow: null
            }
        }, {
            title: "Line Path w/arrow",
            type: "DrawLinePath",
            defaults: {
                startPoint: [Math.round(xc - width / 2), Math.round(yc - (height - 10) / 2)],
                endPoint: [Math.round(xc + width / 2), Math.round(yc + (height - 20) / 2)],
                endArrow: "block"
            }
        }, {
            title: "Line Path w/two arrows",
            type: "DrawLinePath",
            defaults: {
                startPoint: [Math.round(xc - width / 2), Math.round(yc - (height - 10) / 2)],
                endPoint: [Math.round(xc + width / 2), Math.round(yc + (height - 20) / 2)],
                startArrow: "block",
                endArrow: "block"
            }
        }, {
            title: "Rectangle",
            type: "DrawRect",
            defaults: {
                top: rectTop,
                left: rectLeft,
                width: rectWidth,
                height: rectHeight,
                fillGradient: "rect"
            }
        }, {
            title: "Rounded Rectangle",
            type: "DrawRect",
            defaults: {
                top: rectTop,
                left: rectLeft,
                width: rectWidth,
                height: rectHeight,
                rounding: 0.25,
                fillGradient: "rect"
            }
        }, {
            title: "Oval",
            type: "DrawOval",
            defaults: {
                top: rectTop,
                left: rectLeft,
                width: rectWidth,
                height: rectHeight,
                fillGradient: "oval"
            }
        }, {
            title: "Triangle",
            type: "DrawTriangle",
            defaults: {
                points: isc.DrawPane.getRegularPolygonPoints(3, width, height, xc, yc, Math.PI / 2),
                fillGradient: "triangle"
            }
        }, {
            title: "Diamond",
            type: "DrawDiamond",
            defaults: {
                top: rectTop,
                left: rectLeft,
                width: rectWidth,
                height: rectHeight,
                fillGradient: "diamond"
            }
        }, {
            title: "Label",
            type: "DrawLabel",
            defaults: {
                contents: "Text",
                alignment: "center",
                left: xc/2,
                top: yc/2
            }
        }];
        for (var i = 0; i < data.length; ++i) {
            data[i].defaults.titleLabelProperties = {
                lineColor: "#222222"
            };
            data[i].editProxyProperties = {
                inlineEditEvent: "dblOrKeypress"
            };
            
        }
        return data;
    }
});

isc.DynamicForm.create({
    autoDraw: false,
    ID: "exportForm",
    width: "100%",
    numCols: 2,
    wrapItemTitles: false,
    items: [{
        name: "format",
        type: "select",
        title: "Export format",
        valueMap: {
            "png": "PNG",
            "pdf": "PDF"
        },
        defaultValue: "png"
    }, {
        title: "Export",
        type: "button",
        startRow: false, endRow: false,

        click : function (form) {
            var drawPaneNode = editContext.getDrawPaneEditNode(),
                drawPane = drawPaneNode.liveObject,
                format = form.getValue("format"),
                requestProperties = {
                    exportDisplay: "download",
                    exportFilename: "Diagram"
                }
            ;
            if (format == "png") isc.RPCManager.exportImage(drawPane.getSvgString(), requestProperties);
            else isc.RPCManager.exportContent(drawPane, requestProperties);
        }
    }]
});


isc.DynamicForm.create({
    autoDraw: false,
    ID: "drawItemProperties",
    width: "100%",
    numCols: 8,
    colWidths: [100,100,100,50,50,50,50,50],
    titleOrientation: "top",
    fields: [
        { name: "lineColor", title: "Line color",
            type: "color", supportsTransparency: true,
            pickerColorSelected : function (color, opacity) {
                this.Super("pickerColorSelected", arguments);
                this.form.setPropertyOnSelection("lineColor", color);
                this.form.setPropertyOnSelection("lineOpacity", opacity);
            }
        },
        { name: "fillColor", title: "Fill color",
            type: "color", supportsTransparency: true,
            pickerColorSelected : function (color, opacity) {
            this.Super("pickerColorSelected", arguments);
                this.form.setPropertyOnSelection("fillGradient", null);
                this.form.setPropertyOnSelection("fillColor", color);
                this.form.setPropertyOnSelection("fillOpacity", (opacity != null ? opacity/100 : 1.0));
            }
        },
        { name: "arrows", title: "Arrows",
            type: "select",
            valueMap: [ "None", "Start", "End", "Both" ],
            changed : function (form, item, value) {
                this.form.setPropertyOnSelection("startArrow", (value == "Start" || value == "Both" ? "block" : null));
                this.form.setPropertyOnSelection("endArrow", (value == "End" || value == "Both" ? "block" : null));
            }
        },
        { editorType: "SpacerItem", showTitle: false },
        { name: "sendToBack", title: "Send to back", vAlign: "bottom",
            type: "button", startRow: false, endRow: false,
            click: function () {
                var selection = this.form.getSelectedItems();
                if (!selection) return;
                for (var ri = selection.length; ri > 0; --ri) {
                    selection[ri - 1].sendToBack();
                }
            }
        },
        { name: "bringToFront", title: "Bring to front", vAlign: "bottom",
            type: "button", startRow: false, endRow: false,
            click: function () {
                var selection = this.form.getSelectedItems();
                if (!selection) return;
                for (var i = 0, numItems = selection.length; i < numItems; ++i) {
                    selection[i].bringToFront();
                }
            }
        },
        { editorType: "SpacerItem", showTitle: false },
        { name: "removeItem", title: "Remove", vAlign: "bottom",
            type: "button", startRow: false, endRow: false,
            click: function () {
                this.form.removeItem();
            }
        },
    ],
    initWidget : function () {
        this.Super("initWidget", arguments);

        // Set initial field values/state 
        this.selectedEditNodesUpdated();
    },
    removeItem : function () {
        var selection = this.getSelectedNodes();
        if (!selection) return;
        for (var i = 0; i < selection.length; i++) {
            var node = selection[i];

            // Remove node from editContext and destroy it
            this.editContext.removeNode(node);
            node.liveObject.destroy();
        }
    },
    setPropertyOnSelection : function (property, value) {
        var selection = this.getSelectedNodes();
        if (!selection) return;
        var properties = {};
        for (var i = 0; i < selection.length; i++) {
            var node = selection[i];
            properties[property] = value;
            this.editContext.setNodeProperties(node, properties);
            if (value == null) {
                // Remove property when null - set to null above to trigger
                // UI change
                this.editContext.removeNodeProperties(node, [property]);
            }
        }
    },
    getSelectedItems : function () {
        return (this.editContext ? this.editContext.getSelectedComponents() : []);
    },
    getSelectedNodes : function () {
        return (this.editContext ? this.editContext.getSelectedEditNodes() : []);
    },
    selectedEditNodesUpdated : function () {
        var selection = this.getSelectedNodes();
        if (selection.length == 0 || selection.length > 1 || isc.isA.DrawPane(selection[0])) {
            // No selection or multiple selection
            this.getField("lineColor").disable();
            this.getField("fillColor").disable();
            this.getField("arrows").disable();
            var disabled = (selection.length == 0);
            this.getField("sendToBack").setDisabled(disabled);
            this.getField("bringToFront").setDisabled(disabled);
            this.getField("removeItem").setDisabled(disabled);

            this.clearValue("lineColor");
            this.clearValue("fillColor");
            this.clearValue("arrows");
        } else {
            this.getField("sendToBack").enable();
            this.getField("bringToFront").enable();
            this.getField("removeItem").enable();

            // Enable only property controls that are applicable to selection
            var item = selection[0].liveObject,
                itemClass = item.getClass(),
                supportsStartArrow = item.supportsStartArrow(),
                supportsEndArrow = item.supportsEndArrow()
            ;
            this.getField("lineColor").setDisabled(!itemClass.isMethodSupported("setLineColor"));
            this.getField("fillColor").setDisabled(!itemClass.isMethodSupported("setFillColor"));
            this.getField("arrows").setDisabled(!supportsStartArrow && !supportsEndArrow);

            // Update the arrow selections based on the item's support
            var arrowsValueMap = [ "None" ];
            if (supportsStartArrow) arrowsValueMap.add("Start");
            if (supportsEndArrow) arrowsValueMap.add("End");
            if (supportsStartArrow && supportsEndArrow) arrowsValueMap.add("Both");
            this.getField("arrows").setValueMap(arrowsValueMap);

            // Update the form with current values
            var arrows = (item.startArrow && item.endArrow ? "Both" : (item.startArrow ? "Start" : (item.endArrow ? "End" : "None")));
            this.setValue("lineColor", item.lineColor);
            this.setValue("fillColor", item.fillColor);
            this.setValue("arrows", arrows);
        }
    }
});


// The editCanvas is the root component in which the items can be placed.
// This canvas will not be serialized - only the child nodes.
isc.Canvas.create({
    ID: "editCanvas",
    border: "1px solid black",
    width: "100%",
    height: "100%",
    canFocus: true,
    keyPress: function () {
        if (isc.EventHandler.getKey() == "Delete") {
            drawItemProperties.removeItem();
        }
    }
});

var editContext = isc.EditContext.create({
    defaultPalette: tilePalette,
    enableInlineEdit: true,
    canSelectEditNodes: true,

    rootComponent: {
        type: "Canvas",
        liveObject: editCanvas
    },

    init : function () {
        this.Super("init", arguments);

        // Load sample drawing
        if (!isc.DS.get("samples")) {
            isc.DataSource.create({
                ID:"samples",
                dataFormat:"xml",
                recordXPath:"//sample",
                dataURL:"[ISOMORPHIC]/system/reference/inlineExamples/portal/contexts/sampleDrawingData.xml",
                fields:[
                    {name:"componentXml"}
                ]
            });
        }

        var _this = this;
        samples.fetchData(null, function (request, data) {
            if (data && data.length > 0) {
                _this.setSampleDrawing(data[0].componentXml);
            }
        });
    },

    selectedEditNodesUpdated : function (editNode) {
        if (editNode == null || isc.isA.DrawItem(editNode.liveObject)) {
            drawItemProperties.selectedEditNodesUpdated();
        }
    },
    setSampleDrawing : function (componentXml) {
        this.sampleDrawing = componentXml;
        this.showSampleDrawing();
    },
    showSampleDrawing : function () {
        this.destroyAll();
        this.defaultParent = null;

        var _this = this;
        this.addPaletteNodesFromXML(this.sampleDrawing, null, null, function () {
            _this.configureDrawPane();
        });
    },
    
    configureDrawPane : function () {
        // Node drops should be assigned to DrawPane
        var drawPaneEditNode = this.getDrawPaneEditNode();
        this.defaultParent = drawPaneEditNode;
    },

    getDrawPaneEditNode : function () {
        // DrawPane is assumed to be the first node under root.
        var editTree = this.getEditNodeTree(),
            rootNode = this.getRootEditNode(),
            childNodes = editTree.getChildren(rootNode),
            editNode = (childNodes && childNodes.length > 0 ? childNodes[0] : null)
        ;
        return editNode;
    }
});

// Set the defaultEditContext on palette which is used when double-clicking on components.
tilePalette.setDefaultEditContext(editContext);

// Place editCanvas into editMode to allow paletteNode drops
var editCanvasEditNode = editContext.getRootEditNode();
editCanvas.setEditMode(true, editContext, editCanvasEditNode);

// The above use of an edit canvas and edit context can be replaced by
// an EditPane which combines these separate parts into a single component.

drawItemProperties.editContext = editContext;


// Start with an empty drawing until the sample is loaded
editContext.addFromPaletteNode(emptyDrawPanePaletteNode);
editContext.configureDrawPane();


// Layout for the example. The layouts are nested because this
// is used as a basis for other examples, in which some
// user interface elements are added.
isc.VLayout.create({
    ID: "vlayout",
    width: "100%",
    height: "100%",
    membersMargin: 10,
    members: [
        isc.HLayout.create({
            ID: "hlayout",
            membersMargin: 20,
            width: "100%",
            height: "100%",
            members: [
                isc.VLayout.create({
                    membersMargin: 5,
                    members: [
                        tilePalette,
                        exportForm
                    ]
                }),
                isc.VLayout.create({
                    width: "100%",
                    membersMargin: 5,
                    members: [
                        editCanvas,
                        drawItemProperties
                    ]
                })
            ]
        })
    ]
});


isc.Button.create({
    ID: "showComponentXMLButton",
    title: "Show Component XML",
    autoFit: true,

    click : function () {
        var paletteNodes = editContext.serializeAllEditNodes();

        var syntaxHiliter = isc.XMLSyntaxHiliter.create(),
            formattedText = syntaxHiliter.hilite(paletteNodes),
            window = isc.Window.create({
                width: Math.round(vlayout.width / 2),
                defaultHeight: Math.round(vlayout.height * 2/3),
                title: "Component XML",
                autoCenter: true,
                showMinimizeButton: false,
                canDragResize: true,
                isModal: true,
                keepInParentRect: true,
                items: [
                    isc.HTMLFlow.create({
                        canFocus: true,
                        contents: formattedText,
                        canSelectText: true,
                        selectContentOnSelectAll: true
                    })
                ]
            })
        ;

        window.show();
    }
});

isc.Button.create({
    ID: "reloadSampleButton",
    title: "Reload Sample Drawing",
    autoFit: true,

    click : function () {
        // Recreate sample drawing
        editContext.showSampleDrawing();
    }
});

isc.Button.create({
    ID: "clearButton",
    title: "Clear Drawing",
    autoFit: true,

    click : function () {
        // Destroy all the nodes
        editContext.destroyAll();

        // Create default DrawPane
        editContext.addFromPaletteNode(emptyDrawPanePaletteNode);
        editContext.configureDrawPane();
    }
});


// This button will destroy the EditDrawPane and then recreate it from saved state.
isc.Button.create({
    ID: "destroyAndRecreateButton",
    title: "Destroy and Recreate",
    autoFit: true,

    click : function () {
        // We save the editPane node data in a variable
        var paletteNodes = editContext.serializeAllEditNodes();

        // Animate the disappearance of the editCanvas, since otherwise
        // everything happens at once.
        editCanvas.animateFade(0, function () {
            // Once the animation is finished, destroy all the nodes
            editContext.destroyAll();

            // Then add them back from the serialized form
            editContext.addPaletteNodesFromXML(paletteNodes);

            // And make us visible again
            editCanvas.setOpacity(100);
        }, 2000, "smoothEnd");
    }
});

// Create button bar
isc.HLayout.create({
    ID: "actionBar",
    membersMargin: 10,
    width: "100%",
    height: 30,
    members: [
        isc.LayoutSpacer.create({ width: "*" }),
        showComponentXMLButton,
        isc.LayoutSpacer.create({ width: 20 }),
        reloadSampleButton,
        clearButton,
        isc.LayoutSpacer.create({ width: 20 }),
        destroyAndRecreateButton
    ]
});

// This inserts the action buttons into the overall layout for the example.
vlayout.addMember(actionBar, 0);
