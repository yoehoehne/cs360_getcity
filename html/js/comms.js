$(document).ready(function(){
    $("#submitButton").click(function(){
        var myobj = {Name:$("#Name").val(), Comment:$("#Comment").val()};
	var jobj = JSON.stringify(myobj);
	$("#json").text(jobj);
	var url = "http://52.11.22.46/comment";
        $.post(url,jobj,function(data,textStatus) {
          $("#done").text(textStatus);
        });
    });

    $("#getButton").click(function(){
	var url = "http://52.11.22.46/comment";
	$.get(url, function(data, textStatus){
		var everything;
        	everything = "<ul>";
        	$.each(data, function(i,item) {
          		everything += "<li> Name: "+data[i].Name+" Comment: "+data[i].Comment;
        	});
        	everything += "</ul>";
        	$("#comments").html(everything);
	});
    });
});
