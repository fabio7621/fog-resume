// 流體：Jos Stam「Stable Fluids」
export class Fluid {
  constructor(nx, ny) {
    this.nx = nx;
    this.ny = ny;
    this.W = nx + 2;
    const n = (nx + 2) * (ny + 2);
    for (const k of ["u", "v", "u0", "v0", "d", "d0", "p", "div", "curl"])
      this[k] = new Float32Array(n);
    this.solid = new Uint8Array(n);
    this.inflowD = new Float32Array(ny + 2);
    this.inflowV = new Float32Array(ny + 2);
    this.windU = 0;
    this.roadU = 0;
  }
  bnd(x, kind) {
    const { nx, ny, W } = this;
    for (let j = 1; j <= ny; j++) {
      const L = j * W,
        R = L + nx + 1;
      x[L] = kind === "p" ? 0 : x[L + 1];
      if (kind === "u") x[R] = this.windU;
      else if (kind === "v") x[R] = this.inflowV[j];
      else if (kind === "d") x[R] = this.inflowD[j];
      else x[R] = x[R - 1];
    }
    const B = (ny + 1) * W;
    for (let i = 0; i <= nx + 1; i++) {
      x[i] = kind === "v" ? -x[i + W] : x[i + W];
      if (kind === "v") x[B + i] = -x[B + i - W];
      else if (kind === "u") x[B + i] = this.roadU;
      else x[B + i] = x[B + i - W];
    }
  }
  advect(kind, d, d0, u, v, dt) {
    const { nx, ny, W, solid } = this,
      xmax = nx + 0.5,
      ymax = ny + 0.5;
    for (let j = 1; j <= ny; j++) {
      let k = j * W + 1;
      for (let i = 1; i <= nx; i++, k++) {
        if (solid[k]) {
          d[k] = kind === "d" ? d0[k] : 0;
          continue;
        }
        let x = i - dt * u[k],
          y = j - dt * v[k];
        if (x < 0.5) x = 0.5;
        else if (x > xmax) x = xmax;
        if (y < 0.5) y = 0.5;
        else if (y > ymax) y = ymax;
        const i0 = x | 0,
          j0 = y | 0,
          s1 = x - i0,
          s0 = 1 - s1,
          t1 = y - j0,
          t0 = 1 - t1,
          a = i0 + W * j0;
        d[k] =
          s0 * (t0 * d0[a] + t1 * d0[a + W]) +
          s1 * (t0 * d0[a + 1] + t1 * d0[a + 1 + W]);
      }
    }
    this.bnd(d, kind);
  }
  project(iter) {
    const { nx, ny, W, u, v, p, div, solid } = this;
    for (let j = 1; j <= ny; j++) {
      let k = j * W + 1;
      for (let i = 1; i <= nx; i++, k++)
        div[k] = solid[k]
          ? 0
          : -0.5 * (u[k + 1] - u[k - 1] + v[k + W] - v[k - W]);
    }
    this.bnd(p, "p");
    for (let it = 0; it < iter; it++) {
      for (let j = 1; j <= ny; j++) {
        let k = j * W + 1;
        for (let i = 1; i <= nx; i++, k++) {
          if (solid[k]) continue;
          let s = 0,
            n = 0;
          if (!solid[k - 1]) {
            s += p[k - 1];
            n++;
          }
          if (!solid[k + 1]) {
            s += p[k + 1];
            n++;
          }
          if (!solid[k - W]) {
            s += p[k - W];
            n++;
          }
          if (!solid[k + W]) {
            s += p[k + W];
            n++;
          }
          if (n) p[k] = (div[k] + s) / n;
        }
      }
      this.bnd(p, "p");
    }
    for (let j = 1; j <= ny; j++) {
      let k = j * W + 1;
      for (let i = 1; i <= nx; i++, k++) {
        if (solid[k]) {
          u[k] = 0;
          v[k] = 0;
          continue;
        }
        const pl = solid[k - 1] ? p[k] : p[k - 1],
          pr = solid[k + 1] ? p[k] : p[k + 1],
          pu = solid[k - W] ? p[k] : p[k - W],
          pd = solid[k + W] ? p[k] : p[k + W];
        u[k] -= 0.5 * (pr - pl);
        v[k] -= 0.5 * (pd - pu);
      }
    }
    this.bnd(u, "u");
    this.bnd(v, "v");
  }
  vorticity(dt, eps) {
    const { nx, ny, W, u, v, curl, solid } = this;
    for (let j = 1; j <= ny; j++) {
      let k = j * W + 1;
      for (let i = 1; i <= nx; i++, k++)
        curl[k] = 0.5 * (v[k + 1] - v[k - 1] - (u[k + W] - u[k - W]));
    }
    for (let j = 2; j < ny; j++) {
      let k = j * W + 2;
      for (let i = 2; i < nx; i++, k++) {
        if (solid[k]) continue;
        const gx = 0.5 * (Math.abs(curl[k + 1]) - Math.abs(curl[k - 1])),
          gy = 0.5 * (Math.abs(curl[k + W]) - Math.abs(curl[k - W]));
        const len = Math.sqrt(gx * gx + gy * gy) + 1e-5,
          c = curl[k] * eps * dt;
        u[k] += (gy / len) * c;
        v[k] -= (gx / len) * c;
      }
    }
  }
  step(dt, o) {
    const { u, v, u0, v0, d, d0, solid } = this,
      n = u.length;
    if (o.vort > 0) this.vorticity(dt, o.vort);
    if (o.sink > 0)
      for (let k = 0; k < n; k++) if (!solid[k]) v[k] += dt * o.sink * d[k];
    this.bnd(u, "u");
    this.bnd(v, "v");
    this.project(o.iter);
    u0.set(u);
    v0.set(v);
    this.advect("u", u, u0, u0, v0, dt);
    this.advect("v", v, v0, u0, v0, dt);
    this.project(o.iter);
    d0.set(d);
    this.advect("d", d, d0, u, v, dt);
    const keep = Math.exp(-o.decay * dt);
    for (let k = 0; k < n; k++) {
      const x = d[k] * keep;
      d[k] = x > o.cap ? o.cap : x;
    }
  }
}
