package routes

import {
	"net/http"
	"github.com/gin-gonic/gin"
}

func addAuthRoutes(rg *gin.RouterGroup){
	auth := rg.Group("/auth")

	auth.POST("/register",func (){})
	auth.POST("/login", func(){})
	auth.POST("/logout", func(){})
}