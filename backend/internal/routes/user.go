package routes

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

func addUserRoutes(rg *gin.RouterGroup){
	user := rg.Group("/user")

	//endpoint to get user info
	user.GET("/me", func(){})

	//endpoint to update user info
	user.PUT("/me", func(){})
}