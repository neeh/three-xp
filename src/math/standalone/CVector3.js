class CVector3 extends Float32Array {

  constructor() {
    super(3);
  }

  elements(x, y, z) {
    this[0] = x;
    this[1] = y;
    this[2] = z;
  }

}
