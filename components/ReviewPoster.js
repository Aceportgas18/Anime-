import React, { useRef, useEffect } from "react"

const ReviewPoster = ({ animeImage, userImage, rating, companyLogo, username }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Update canvas size to fit common social media story aspect ratios (9:16)
    // Using 1080x1920 for full HD story size, widely supported
    const width = 1080
    const height = 1920
    canvas.width = width
    canvas.height = height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw anime background
    const bgImage = new Image()
    bgImage.crossOrigin = "anonymous"
    bgImage.src = animeImage
      bgImage.onload = () => {
        ctx.drawImage(bgImage, 0, 0, width, height)

        // Draw a separate opaque panel at bottom for profile details and logo
        const panelHeight = 220
        ctx.fillStyle = "rgba(50, 48, 48, 0.85)"
        ctx.fillRect(0, height - panelHeight, width, panelHeight)

        // Draw user profile image circle on panel
        const profileSize = 140
        const profileX = 50
        const profileY = height - panelHeight + (panelHeight - profileSize) / 2

        const userImg = new Image()
        userImg.crossOrigin = "anonymous"
        userImg.src = userImage
        userImg.onload = () => {
          ctx.save()
          ctx.beginPath()
          ctx.arc(profileX + profileSize / 2, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2)
          ctx.closePath()
          ctx.clip()
          ctx.drawImage(userImg, profileX, profileY, profileSize, profileSize)
          ctx.restore()

          // Draw username next to profile with black outline for visibility
          ctx.font = "bold 50px Arial"
          ctx.lineWidth = 12
          ctx.strokeStyle = "white"
          ctx.strokeText(username, profileX + profileSize + 50, profileY + profileSize / 2 + 20)
          ctx.fillStyle = "white"
          ctx.fillText(username, profileX + profileSize + 50, profileY + profileSize / 2 + 20)
          ctx.lineWidth = 1
          

          // Draw rating stars on panel below username with black outline for visibility
          const starSize = 120
          const starXStart = profileX
          const starY = profileY + profileSize + 50
          const fullStars = Math.floor(rating)
          const halfStar = rating % 1 >= 0.5

          for (let i = 0; i < 5; i++) {
            ctx.lineWidth = 10
            ctx.strokeStyle = "white"
            ctx.fillStyle = i < fullStars ? "white" : "gray"
            ctx.beginPath()
            const x = starXStart + i * (starSize + 20)
            const y = starY
            ctx.moveTo(x + starSize / 2, y)
            for (let j = 1; j < 5; j++) {
              ctx.lineTo(
                x + starSize / 2 + starSize * Math.cos((18 + 72 * j) * Math.PI / 180),
                y + starSize * Math.sin((18 + 72 * j) * Math.PI / 180)
              )
              ctx.lineTo(
                x + starSize / 2 + (starSize / 2) * Math.cos((54 + 72 * j) * Math.PI / 180),
                y + starSize * Math.sin((54 + 72 * j) * Math.PI / 180)
              )
            }
            ctx.closePath()
            ctx.stroke()
            ctx.fill()
          }
          ctx.lineWidth = 1
          ctx.strokeStyle = "transparent"

          // Draw company logo at bottom right on panel with shadow
          const logoSize = 140
          const logoX = width - logoSize - 50
          const logoY = height - panelHeight + (panelHeight - logoSize) / 2
          const logoImg = new Image()
          logoImg.crossOrigin = "anonymous"
          logoImg.src = companyLogo
          logoImg.onload = () => {
            ctx.shadowColor = "rgba(0,0,0,0.9)"
            ctx.shadowBlur = 12
            ctx.shadowOffsetX = 4
            ctx.shadowOffsetY = 4
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
            ctx.shadowColor = "transparent"
            ctx.shadowBlur = 0
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0
          }
        }
      }
  }, [animeImage, userImage, rating, companyLogo, username])

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", maxWidth: "600px", height: "auto", border: "1px solid #ccc" }} />
    </div>
  )
}

export default ReviewPoster
