function del(name) {
    console.log(name)
    Swal.fire({
        title: "Delete it",
        showConfirmButton: true,
        showCancelButton: true,
        icon: "error"
    }).then(r=>{
        if(r.value){
            $.ajax({
                type: "POST",
                url: "http://localhost:5000/admin/delete",
                data: {name},
                dataType: "json",
                success: function (response) {
                    if(response.check){
                        Swal.fire({
                            title: "Success",
                            showConfirmButton: false,
                            showCancelButton:false,
                            icon:"success",
                            timer: 1500
                        })
                    }
                }
            });
        }
    })
   
}