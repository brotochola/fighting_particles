varying vec2 vTextureCoord;
varying vec2 texPos;


uniform sampler2D uTexture;
uniform float uTime;
uniform float mousePosX;
uniform float mousePosY;
uniform float width;
uniform float height;

uniform float offsetX;
uniform float offsetY;

uniform float puntoX;
uniform float puntoY;

vec2 punto;

void main(void) {
  punto = vec2(puntoX, puntoY);
    // Use vScreenPosition to calculate or debug

    // Example: visualize screen-space coordinates as color
  float ratioX = (mousePosX + offsetX) / width;
  float ratioY = (mousePosY + offsetY) / (height);
  vec2 newMousePos = vec2(ratioX, ratioY);

  vec2 pixelPosInContainer = vec2(vTextureCoord.x * width - offsetX, vTextureCoord.y * width - offsetY);

  vec4 pixel = texture2D(uTexture, vTextureCoord);

  // float dist = distance(newMousePos, vTextureCoord);

  // float distAlPunto = distance(pixelPosInContainer, punto);

  // if(pixelPosInContainer.x > width * 0.5 && pixelPosInContainer.x < width * 0.51 && pixelPosInContainer.y > height * 0.5 && pixelPosInContainer.y < height * 0.51) {
  //   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  // } else {
  //   gl_FragColor = vec4(pixel.rgb, distAlPunto * 0.01);
  // }

  float alpha = distance(texPos.xy, punto.xy) * 10.0;

  gl_FragColor = vec4(pixel.rgb, alpha);

}
