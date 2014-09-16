window.onload = function() {
		var fileInput = document.getElementById('fileInput');
		var fileDisplayArea = document.getElementsByName('code');

		fileInput.addEventListener('change', function(e) {
			var file = fileInput.files[0];
			var textType = /text.*/;

			if (file.type.match(textType)) {
				var reader = new FileReader();
                
				reader.onload = function(e) {
					fileDisplayArea[0].innerText = reader.result;
				}

				reader.readAsText(file);	
			} else {
				fileDisplayArea[0].innerText = "File not supported!";
			}
		});
}
