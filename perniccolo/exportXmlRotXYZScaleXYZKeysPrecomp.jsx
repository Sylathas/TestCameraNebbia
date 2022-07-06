myFunction()

var content;

function myFunction() {


    var myComp = app.project.activeItem 

     if (myComp  == null )
     {
            alert("null item, select a comp");
            return ;
     }

     if (!(myComp  instanceof CompItem))
     {
            alert("not a comp, select a comp");
            return;
    }
 
 //   var contentPath="images/";
    //var myFilePath="/c/Users/can/Desktop/testtest.txt";
    //var myFilePath="~/Desktop/notariImmagini/xml/mediadata.xml";
    //var myFilePath="~/Desktop/mediadata.xml";
    var myFilePath="F:/motus_torino/xml/3erone.xml"
    var myFile=new File(myFilePath);  
    myFile.open("w");
    myFile.encoding = "utf8";  

    
    content="<mediadata>\n";

    doComp(myComp);

    content=content.concat("</mediadata>")       

    var res= myFile.write(content);
    myFile.close()
    

    
      //  alert("file written "+res)
        
        
       /*alert (File(myFilePath).exists.toString()) 
       alert(myFile.absoluteURI)
        $.writeln(myFile.absoluteURI)
       var parentFolder = myFile.parent;  
       alert("parent folder exists "+ parentFolder.exists.toString())*/
       
       /*alert ("isSecurityPrefSet "+ 
       app.preferences.getPrefAsLong(  
            "Main Pref Section",  
            "Pref_SCRIPTING_FILE_NETWORK_SECURITY"  
        )
        )*/
    // file exists  

}

function doComp(_comp){
        
    for (var i=1; i<=_comp.numLayers; i++)
    {
        //$.writeln("COMP "+currComp.name);
        var layer = _comp.layer(i);
       //$.writeln("lay "+ layer.name);

       //$.writeln("AVLayer  "+(layer instanceof AVLayer ));
       //$.writeln("FileSource  "+(layer.source instanceof CompItem));

        if ( layer instanceof AVLayer && (layer.source.mainSource instanceof FileSource  || layer.source instanceof CompItem) ) {
       //     $.writeln("layer is file " );
            var nome = layer.name;
            var source = layer.source;
            var pos = layer.position.value ;
            var scala = layer.scale.value ;
            
            

//            var anchor = layer.anchorPoint.value ;
            content=content.concat("\n<media>\n")
            
            if (source.mainSource instanceof FileSource) {
                content=content.concat("<type>img</type>\n")
            }
            if (source instanceof CompItem) {
                content=content.concat("<type>comp</type>\n")
            }
            //$.writeln("scal 0 "+Math.floor(scala[0]) );
            content=content.concat("<src>"+source.name+"</src>\n")
            content=content.concat("<nome>"+nome+"</nome>\n")
            
            content=content.concat("<offsetcompx>"+(layer.containingComp.width/2).toFixed(2)+"</offsetcompx>\n")
            content=content.concat("<offsetcompy>"+(layer.containingComp.height/2).toFixed(2)+"</offsetcompy>\n")
            
            

            //content=content.concat("<scala>"+Math.floor(scala[0]) +"</scala>\n")
            // content=content.concat(" style=\"transform: translate3d(" +(pos[0]-anchor[0])+"px ,"+ (pos[1]-anchor[1]) + "px, " + (-pos[2]+anchor[2]) +"px);\" >\n" ) 
             
            nKeys = layer.position.numKeys
            if (nKeys==0) 
            { 
                content=content.concat("<x>"+pos[0].toFixed(2)+"</x>\n")
                content=content.concat("<y>"+pos[1].toFixed(2)+"</y>\n")
                content=content.concat("<z>"+pos[2].toFixed(2)+"</z>\n")

            }
            else
            {
                for (var k=1; k<=nKeys; k++ )
                {
                    content=content.concat("\n<keypos>\n")

                    $.writeln("KeyPos "+k );
                    t=layer.position.keyTime(k)
                    $.writeln("nTime "+t );
                    p=layer.position.keyValue(k)
                    $.writeln("v "+v.toString());
                    content=content.concat("<time>"+t.toFixed(2)+"</time>\n")

                    content=content.concat("<x>"+p[0].toFixed(2)+"</x>\n")
                    content=content.concat("<y>"+p[1].toFixed(2)+"</y>\n")
                    content=content.concat("<z>"+p[2].toFixed(2)+"</z>\n")

                    
                    content=content.concat("</keypos>\n\n")
                }

            }
        
            nKeys = layer.rotationX.numKeys
            if (nKeys==0) 
            { 
                content=content.concat("<rotx>"+layer.rotationX.value.toFixed(2)+"</rotx>\n")
                content=content.concat("<roty>"+layer.rotationY.value.toFixed(2)+"</roty>\n")             
                content=content.concat("<rotz>"+layer.rotationZ.value.toFixed(2)+"</rotz>\n")
             
            }
            else
            {
                for (var k=1; k<=nKeys; k++ )
                {
                    content=content.concat("\n<keyrot>\n")

                    $.writeln("KeyRot "+k );
                    t=layer.rotationX.keyTime(k)
                    $.writeln("nTime "+t );
                    rotx=layer.rotationX.keyValue(k)
                    roty=layer.rotationY.keyValue(k)
                    rotz=layer.rotationZ.keyValue(k)
                    
                    content=content.concat("<time>"+t.toFixed(2)+"</time>\n")
                    content=content.concat("<rotx>"+rotx.toFixed(2)+"</rotx>\n")
                    content=content.concat("<roty>"+roty.toFixed(2)+"</roty>\n")
                    content=content.concat("<rotz>"+rotz.toFixed(2)+"</rotz>\n")
                    
                    content=content.concat("</keyrot>\n\n")
                }

            }


            nKeys = layer.scale.numKeys
            if (nKeys==0) 
            { 
                content=content.concat("<scalax>"+scala[0].toFixed(2) +"</scalax>\n")
                content=content.concat("<scalay>"+scala[1].toFixed(2) +"</scalay>\n")
                content=content.concat("<scalaz>"+scala[2].toFixed(2) +"</scalaz>\n")

            }
            else
            {
                for (var k=1; k<=nKeys; k++ )
                {
                    content=content.concat("\n<keyscale>\n")

                    t=layer.position.keyTime(k)
                    s=layer.scale.keyValue(k)
                    content=content.concat("<time>"+t.toFixed(2)+"</time>\n")

                    content=content.concat("<scalax>"+s[0].toFixed(2)+"</scalax>\n")
                    content=content.concat("<scalay>"+s[1].toFixed(2)+"</scalay>\n")
                    content=content.concat("<scalaz>"+s[2].toFixed(2)+"</scalaz>\n")

                    
                    content=content.concat("</keyscale>\n\n")
                }

            }
        
            if (source instanceof CompItem) {
                doComp(source);
            }

             content=content.concat("</media>\n\n") ;
             
             

        }


    }
}





//var myProperty = myLayer.position;
//var myPosition = myProperty.value
//position has propertyValueType of ThreeD_SPATIAL, and is stored as an array of 3 f loats
//myProper ty.s etValue([10.0, 30.0, 0.0]);
// Variable myPosition is an array of 3 f loats
//var myPosition = myProperty.value;