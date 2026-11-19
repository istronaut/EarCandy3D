package routes

import(
	"net/http"
	"github.com/gin-gonic/gin"
)

var router := gin.Default()

func Run(){
	//Adding a health checkpoint before adding other routes
	router.GET("/health", func(c *gin.Context){
		c.JSON(http.StatusOK, gin.H{
			"message": "Server is running",
		})
	})

	addRoutes()
	_ = router.Run(":5000")
}

func addRoutes(){
	v1 := router.Group("/api/v1")
	addAuthRoutes(v1)
	addUserRoutes(v1)
	addProductRoutes(v1)
	addCartRoutes(v1)
	addOrderRoutes(v1)
}