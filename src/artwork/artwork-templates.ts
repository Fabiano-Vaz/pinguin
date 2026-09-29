// Static HTML layers; edit contours and motion in css/modules/artwork.css.
export const artworkTemplates: Record<string, {width: number; height: number; html: string}> = {
  idle: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-idle-view">
  <div class="art-layer art-idle-1">
    <div class="art-shape art-idle-1-shape"></div>
  </div>
  <div class="art-layer art-idle-2">
    <div class="art-shape art-idle-2-shape"></div>
  </div>
  <div class="art-layer art-idle-3-motion-0">
    <div class="art-layer art-idle-3">
      <div class="art-layer art-idle-4">
        <div class="art-layer art-idle-4-fill"></div>
      </div>
      <div class="art-layer art-idle-5">
        <div class="art-layer art-idle-5-fill"></div>
      </div>
      <div class="art-layer art-idle-6-transform">
        <div class="art-layer art-idle-6">
          <div class="art-layer art-idle-6-fill"></div>
        </div>
      </div>
      <div class="art-layer art-idle-7-transform">
        <div class="art-layer art-idle-7">
          <div class="art-layer art-idle-7-fill"></div>
        </div>
      </div>
      <div class="art-layer art-idle-8-transform">
        <div class="art-layer art-idle-8">
          <div class="art-layer art-idle-9">
            <div class="art-shape art-idle-9-shape"></div>
          </div>
          <div class="art-layer art-idle-10">
            <div class="art-shape art-idle-10-shape"></div>
          </div>
          <div class="art-layer art-idle-11">
            <div class="art-layer art-idle-12-transform">
              <div class="art-layer art-idle-12">
                <div class="art-shape art-idle-12-shape"></div>
              </div>
            </div>
            <div class="art-layer art-idle-13-transform">
              <div class="art-layer art-idle-13">
                <div class="art-shape art-idle-13-shape"></div>
              </div>
            </div>
            <div class="art-layer art-idle-14-transform">
              <div class="art-layer art-idle-14">
                <div class="art-shape art-idle-14-shape"></div>
              </div>
            </div>
          </div>
          <div class="art-layer art-idle-15">
            <div class="art-shape art-idle-15-shape"></div>
          </div>
          <div class="art-layer art-idle-16">
            <div class="art-shape art-idle-16-shape"></div>
          </div>
          <div class="art-layer art-idle-17">
            <div class="art-shape art-idle-17-shape"></div>
          </div>
          <div class="art-layer art-idle-18">
            <div class="art-shape art-idle-18-shape"></div>
          </div>
          <div class="art-layer art-idle-19">
            <div class="art-layer art-idle-19-fill"></div>
            <div class="art-layer art-idle-19-stroke"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="art-layer art-idle-20-transform">
    <div class="art-layer art-idle-20">
      <div class="art-layer art-idle-21-transform">
        <div class="art-layer art-idle-21">
          <div class="art-layer art-idle-22-motion-0">
            <div class="art-layer art-idle-22">
              <div class="art-layer art-idle-23">
                <div class="art-layer art-idle-23-fill"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="art-layer art-idle-24-transform">
        <div class="art-layer art-idle-24">
          <div class="art-layer art-idle-25-motion-0">
            <div class="art-layer art-idle-25">
              <div class="art-layer art-idle-26">
                <div class="art-layer art-idle-26-fill"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  default: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-default-view">
  <div class="art-layer art-default-1">
    <div class="art-shape art-default-1-shape"></div>
  </div>
  <div class="art-layer art-default-2">
    <div class="art-layer art-default-3">
      <div class="art-layer art-default-3-fill"></div>
      <div class="art-layer art-default-3-stroke"></div>
    </div>
    <div class="art-layer art-default-4">
      <div class="art-layer art-default-4-fill"></div>
      <div class="art-layer art-default-4-stroke"></div>
    </div>
  </div>
  <div class="art-layer art-default-5">
    <div class="art-layer art-default-5-fill"></div>
  </div>
  <div class="art-layer art-default-6-transform">
    <div class="art-layer art-default-6">
      <div class="art-layer art-default-7">
        <div class="art-shape art-default-7-shape"></div>
      </div>
      <div class="art-layer art-default-8">
        <div class="art-shape art-default-8-shape"></div>
      </div>
      <div class="art-layer art-default-9">
        <div class="art-layer art-default-10-transform">
          <div class="art-layer art-default-10">
            <div class="art-shape art-default-10-shape"></div>
          </div>
        </div>
        <div class="art-layer art-default-11-transform">
          <div class="art-layer art-default-11">
            <div class="art-shape art-default-11-shape"></div>
          </div>
        </div>
        <div class="art-layer art-default-12-transform">
          <div class="art-layer art-default-12">
            <div class="art-shape art-default-12-shape"></div>
          </div>
        </div>
        <div class="art-layer art-default-13-transform">
          <div class="art-layer art-default-13">
            <div class="art-shape art-default-13-shape"></div>
          </div>
        </div>
        <div class="art-layer art-default-14-transform">
          <div class="art-layer art-default-14">
            <div class="art-shape art-default-14-shape"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-default-15">
        <div class="art-shape art-default-15-shape"></div>
      </div>
      <div class="art-layer art-default-16">
        <div class="art-shape art-default-16-shape"></div>
      </div>
      <div class="art-layer art-default-17">
        <div class="art-shape art-default-17-shape"></div>
      </div>
      <div class="art-layer art-default-18">
        <div class="art-shape art-default-18-shape"></div>
      </div>
      <div class="art-layer art-default-19">
        <div class="art-layer art-default-19-fill"></div>
        <div class="art-layer art-default-19-stroke"></div>
      </div>
    </div>
  </div>
  <div class="art-layer art-default-20">
    <div class="art-layer art-default-20-fill"></div>
  </div>
  <div class="art-layer art-default-21">
    <div class="art-layer art-default-21-fill"></div>
  </div>
  <div class="art-layer art-default-22">
    <div class="art-layer art-default-22-fill"></div>
  </div>
</div>`,
  },
  running: {
    width: 260.0,
    height: 288.0,
    html: `<div class="art-layer art-running-view">
  <div class="art-layer art-running-1">
    <div class="art-shape art-running-1-shape"></div>
  </div>
  <div class="art-layer art-running-2-motion-0">
    <div class="art-layer art-running-2-motion-1">
      <div class="art-layer art-running-2">
        <div class="art-layer art-running-3">
          <div class="art-layer art-running-3-fill"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="art-layer art-running-4-motion-0">
    <div class="art-layer art-running-4-motion-1">
      <div class="art-layer art-running-4">
        <div class="art-layer art-running-5">
          <div class="art-layer art-running-5-fill"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="art-layer art-running-6-motion-0">
    <div class="art-layer art-running-6">
      <div class="art-layer art-running-7">
        <div class="art-layer art-running-7-fill"></div>
      </div>
      <div class="art-layer art-running-8">
        <div class="art-layer art-running-8-fill"></div>
      </div>
      <div class="art-layer art-running-9">
        <div class="art-layer art-running-9-fill"></div>
      </div>
    </div>
  </div>
</div>`,
  },
  runningCrouched: {
    width: 260.0,
    height: 288.0,
    html: `<div class="art-layer art-runningCrouched-view">
  <div class="art-layer art-runningCrouched-1">
    <div class="art-shape art-runningCrouched-1-shape"></div>
  </div>
  <div class="art-layer art-runningCrouched-2-motion-0">
    <div class="art-layer art-runningCrouched-2-motion-1">
      <div class="art-layer art-runningCrouched-2">
        <div class="art-layer art-runningCrouched-3">
          <div class="art-layer art-runningCrouched-3-fill"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="art-layer art-runningCrouched-4-motion-0">
    <div class="art-layer art-runningCrouched-4-motion-1">
      <div class="art-layer art-runningCrouched-4">
        <div class="art-layer art-runningCrouched-5">
          <div class="art-layer art-runningCrouched-5-fill"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="art-layer art-runningCrouched-6-motion-0">
    <div class="art-layer art-runningCrouched-6-motion-1">
      <div class="art-layer art-runningCrouched-6">
        <div class="art-layer art-runningCrouched-7-transform">
          <div class="art-layer art-runningCrouched-7">
            <div class="art-layer art-runningCrouched-8-clip">
              <div class="art-layer art-runningCrouched-8">
                <div class="art-layer art-runningCrouched-8-fill"></div>
              </div>
            </div>
            <div class="art-layer art-runningCrouched-9-clip">
              <div class="art-layer art-runningCrouched-9">
                <div class="art-layer art-runningCrouched-9-fill"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="art-layer art-runningCrouched-10-transform">
          <div class="art-layer art-runningCrouched-10">
            <div class="art-layer art-runningCrouched-11-clip">
              <div class="art-layer art-runningCrouched-11">
                <div class="art-layer art-runningCrouched-11-fill"></div>
              </div>
            </div>
            <div class="art-layer art-runningCrouched-12-clip">
              <div class="art-layer art-runningCrouched-12">
                <div class="art-layer art-runningCrouched-12-fill"></div>
              </div>
            </div>
            <div class="art-layer art-runningCrouched-13-clip">
              <div class="art-layer art-runningCrouched-13">
                <div class="art-layer art-runningCrouched-13-fill"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  flying: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-flying-view">
  <div class="art-layer art-flying-1">
    <div class="art-shape art-flying-1-shape"></div>
  </div>
  <div class="art-layer art-flying-2-motion-0">
    <div class="art-layer art-flying-2">
      <div class="art-layer art-flying-3">
        <div class="art-layer art-flying-4">
          <div class="art-layer art-flying-4-fill"></div>
          <div class="art-layer art-flying-4-stroke"></div>
        </div>
        <div class="art-layer art-flying-5">
          <div class="art-layer art-flying-5-fill"></div>
          <div class="art-layer art-flying-5-stroke"></div>
        </div>
      </div>
      <div class="art-layer art-flying-6">
        <div class="art-layer art-flying-6-fill"></div>
      </div>
      <div class="art-layer art-flying-7">
        <div class="art-layer art-flying-7-fill"></div>
      </div>
      <div class="art-layer art-flying-8-transform">
        <div class="art-layer art-flying-8">
          <div class="art-layer art-flying-9">
            <div class="art-shape art-flying-9-shape"></div>
          </div>
          <div class="art-layer art-flying-10">
            <div class="art-shape art-flying-10-shape"></div>
          </div>
          <div class="art-layer art-flying-11">
            <div class="art-layer art-flying-12-transform">
              <div class="art-layer art-flying-12">
                <div class="art-shape art-flying-12-shape"></div>
              </div>
            </div>
            <div class="art-layer art-flying-13-transform">
              <div class="art-layer art-flying-13">
                <div class="art-shape art-flying-13-shape"></div>
              </div>
            </div>
            <div class="art-layer art-flying-14-transform">
              <div class="art-layer art-flying-14">
                <div class="art-shape art-flying-14-shape"></div>
              </div>
            </div>
          </div>
          <div class="art-layer art-flying-15">
            <div class="art-shape art-flying-15-shape"></div>
          </div>
          <div class="art-layer art-flying-16">
            <div class="art-shape art-flying-16-shape"></div>
          </div>
          <div class="art-layer art-flying-17">
            <div class="art-shape art-flying-17-shape"></div>
          </div>
          <div class="art-layer art-flying-18">
            <div class="art-shape art-flying-18-shape"></div>
          </div>
          <div class="art-layer art-flying-19">
            <div class="art-shape art-flying-19-shape"></div>
          </div>
          <div class="art-layer art-flying-20">
            <div class="art-shape art-flying-20-shape"></div>
          </div>
          <div class="art-layer art-flying-21">
            <div class="art-layer art-flying-21-fill"></div>
            <div class="art-layer art-flying-21-stroke"></div>
          </div>
          <div class="art-layer art-flying-22">
            <div class="art-layer art-flying-22-fill"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-flying-23-motion-0">
        <div class="art-layer art-flying-23">
          <div class="art-layer art-flying-24">
            <div class="art-layer art-flying-24-fill"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-flying-25-motion-0">
        <div class="art-layer art-flying-25">
          <div class="art-layer art-flying-26">
            <div class="art-layer art-flying-26-fill"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  dancing: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-dancing-view">
  <div class="art-layer art-dancing-1">
    <div class="art-shape art-dancing-1-shape"></div>
  </div>
  <div class="art-layer art-dancing-2-transform">
    <div class="art-layer art-dancing-2">
      <div class="art-layer art-dancing-3-motion-0">
        <div class="art-layer art-dancing-3">
          <div class="art-layer art-dancing-4-transform">
            <div class="art-layer art-dancing-4">
              <div class="art-layer art-dancing-5">
                <div class="art-layer art-dancing-6-motion-0">
                  <div class="art-layer art-dancing-6">
                    <div class="art-layer art-dancing-7">
                      <div class="art-layer art-dancing-7-fill"></div>
                      <div class="art-layer art-dancing-7-stroke"></div>
                    </div>
                  </div>
                </div>
                <div class="art-layer art-dancing-8-motion-0">
                  <div class="art-layer art-dancing-8">
                    <div class="art-layer art-dancing-9">
                      <div class="art-layer art-dancing-9-fill"></div>
                      <div class="art-layer art-dancing-9-stroke"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="art-layer art-dancing-10">
                <div class="art-layer art-dancing-10-fill"></div>
              </div>
              <div class="art-layer art-dancing-11">
                <div class="art-layer art-dancing-11-fill"></div>
              </div>
              <div class="art-layer art-dancing-12-transform">
                <div class="art-layer art-dancing-12">
                  <div class="art-layer art-dancing-13">
                    <div class="art-shape art-dancing-13-shape"></div>
                  </div>
                  <div class="art-layer art-dancing-14">
                    <div class="art-layer art-dancing-15">
                      <div class="art-shape art-dancing-15-shape"></div>
                    </div>
                    <div class="art-layer art-dancing-16">
                      <div class="art-layer art-dancing-17-transform">
                        <div class="art-layer art-dancing-17">
                          <div class="art-shape art-dancing-17-shape"></div>
                        </div>
                      </div>
                      <div class="art-layer art-dancing-18-transform">
                        <div class="art-layer art-dancing-18">
                          <div class="art-shape art-dancing-18-shape"></div>
                        </div>
                      </div>
                      <div class="art-layer art-dancing-19-transform">
                        <div class="art-layer art-dancing-19">
                          <div class="art-shape art-dancing-19-shape"></div>
                        </div>
                      </div>
                      <div class="art-layer art-dancing-20-transform">
                        <div class="art-layer art-dancing-20">
                          <div class="art-shape art-dancing-20-shape"></div>
                        </div>
                      </div>
                      <div class="art-layer art-dancing-21-transform">
                        <div class="art-layer art-dancing-21">
                          <div class="art-shape art-dancing-21-shape"></div>
                        </div>
                      </div>
                    </div>
                    <div class="art-layer art-dancing-22">
                      <div class="art-shape art-dancing-22-shape"></div>
                    </div>
                    <div class="art-layer art-dancing-23">
                      <div class="art-shape art-dancing-23-shape"></div>
                    </div>
                    <div class="art-layer art-dancing-24">
                      <div class="art-shape art-dancing-24-shape"></div>
                    </div>
                    <div class="art-layer art-dancing-25">
                      <div class="art-shape art-dancing-25-shape"></div>
                    </div>
                    <div class="art-layer art-dancing-26">
                      <div class="art-layer art-dancing-26-fill"></div>
                      <div class="art-layer art-dancing-26-stroke"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="art-layer art-dancing-27-motion-0">
                <div class="art-layer art-dancing-27">
                  <div class="art-layer art-dancing-28">
                    <div class="art-layer art-dancing-28-fill"></div>
                  </div>
                </div>
              </div>
              <div class="art-layer art-dancing-29-motion-0">
                <div class="art-layer art-dancing-29">
                  <div class="art-layer art-dancing-30">
                    <div class="art-layer art-dancing-30-fill"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  sleeping: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-sleeping-view">
  <div class="art-layer art-sleeping-1">
    <div class="art-shape art-sleeping-1-shape"></div>
  </div>
  <div class="art-layer art-sleeping-2">
    <div class="art-layer art-sleeping-3">
      <div class="art-layer art-sleeping-3-fill"></div>
      <div class="art-layer art-sleeping-3-stroke"></div>
    </div>
    <div class="art-layer art-sleeping-4">
      <div class="art-layer art-sleeping-4-fill"></div>
      <div class="art-layer art-sleeping-4-stroke"></div>
    </div>
  </div>
  <div class="art-layer art-sleeping-5-motion-0">
    <div class="art-layer art-sleeping-5">
      <div class="art-layer art-sleeping-6">
        <div class="art-layer art-sleeping-6-fill"></div>
      </div>
      <div class="art-layer art-sleeping-7">
        <div class="art-layer art-sleeping-7-fill"></div>
      </div>
      <div class="art-layer art-sleeping-8">
        <div class="art-layer art-sleeping-8-fill"></div>
      </div>
      <div class="art-layer art-sleeping-9">
        <div class="art-layer art-sleeping-9-fill"></div>
      </div>
      <div class="art-layer art-sleeping-10-transform">
        <div class="art-layer art-sleeping-10">
          <div class="art-layer art-sleeping-11">
            <div class="art-shape art-sleeping-11-shape"></div>
          </div>
          <div class="art-layer art-sleeping-12">
            <div class="art-shape art-sleeping-12-shape"></div>
          </div>
          <div class="art-layer art-sleeping-13">
            <div class="art-layer art-sleeping-14-transform">
              <div class="art-layer art-sleeping-14">
                <div class="art-shape art-sleeping-14-shape"></div>
              </div>
            </div>
            <div class="art-layer art-sleeping-15-transform">
              <div class="art-layer art-sleeping-15">
                <div class="art-shape art-sleeping-15-shape"></div>
              </div>
            </div>
            <div class="art-layer art-sleeping-16-transform">
              <div class="art-layer art-sleeping-16">
                <div class="art-shape art-sleeping-16-shape"></div>
              </div>
            </div>
            <div class="art-layer art-sleeping-17-transform">
              <div class="art-layer art-sleeping-17">
                <div class="art-shape art-sleeping-17-shape"></div>
              </div>
            </div>
            <div class="art-layer art-sleeping-18-transform">
              <div class="art-layer art-sleeping-18">
                <div class="art-shape art-sleeping-18-shape"></div>
              </div>
            </div>
          </div>
          <div class="art-layer art-sleeping-19">
            <div class="art-layer art-sleeping-19-stroke"></div>
          </div>
          <div class="art-layer art-sleeping-20">
            <div class="art-layer art-sleeping-20-stroke"></div>
          </div>
          <div class="art-layer art-sleeping-21">
            <div class="art-layer art-sleeping-21-fill"></div>
            <div class="art-layer art-sleeping-21-stroke"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="art-layer art-sleeping-22">
    <span class="art-text">Z</span>
  </div>
  <div class="art-layer art-sleeping-23">
    <span class="art-text">Z</span>
  </div>
  <div class="art-layer art-sleeping-24">
    <span class="art-text">Z</span>
  </div>
</div>`,
  },
  scared: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-scared-view">
  <div class="art-layer art-scared-1">
    <div class="art-shape art-scared-1-shape"></div>
  </div>
  <div class="art-layer art-scared-2-motion-0">
    <div class="art-layer art-scared-2">
      <div class="art-layer art-scared-3">
        <div class="art-layer art-scared-4">
          <div class="art-layer art-scared-4-fill"></div>
          <div class="art-layer art-scared-4-stroke"></div>
        </div>
        <div class="art-layer art-scared-5">
          <div class="art-layer art-scared-5-fill"></div>
          <div class="art-layer art-scared-5-stroke"></div>
        </div>
      </div>
      <div class="art-layer art-scared-6">
        <div class="art-layer art-scared-6-fill"></div>
      </div>
      <div class="art-layer art-scared-7">
        <div class="art-layer art-scared-7-fill"></div>
      </div>
      <div class="art-layer art-scared-8-transform">
        <div class="art-layer art-scared-8">
          <div class="art-layer art-scared-9">
            <div class="art-shape art-scared-9-shape"></div>
          </div>
          <div class="art-layer art-scared-10">
            <div class="art-layer art-scared-11">
              <div class="art-shape art-scared-11-shape"></div>
            </div>
            <div class="art-layer art-scared-12">
              <div class="art-layer art-scared-13-transform">
                <div class="art-layer art-scared-13">
                  <div class="art-shape art-scared-13-shape"></div>
                </div>
              </div>
              <div class="art-layer art-scared-14-transform">
                <div class="art-layer art-scared-14">
                  <div class="art-shape art-scared-14-shape"></div>
                </div>
              </div>
              <div class="art-layer art-scared-15-transform">
                <div class="art-layer art-scared-15">
                  <div class="art-shape art-scared-15-shape"></div>
                </div>
              </div>
            </div>
            <div class="art-layer art-scared-16">
              <div class="art-shape art-scared-16-shape"></div>
            </div>
            <div class="art-layer art-scared-17">
              <div class="art-shape art-scared-17-shape"></div>
            </div>
            <div class="art-layer art-scared-18">
              <div class="art-shape art-scared-18-shape"></div>
            </div>
            <div class="art-layer art-scared-19">
              <div class="art-shape art-scared-19-shape"></div>
            </div>
            <div class="art-layer art-scared-21">
              <div class="art-shape art-scared-21-shape"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="art-layer art-scared-22-motion-0">
        <div class="art-layer art-scared-22">
          <div class="art-layer art-scared-23">
            <div class="art-layer art-scared-23-fill"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-scared-24-motion-0">
        <div class="art-layer art-scared-24">
          <div class="art-layer art-scared-25">
            <div class="art-layer art-scared-25-fill"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  crying: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-crying-view">
  <div class="art-layer art-crying-1">
    <div class="art-shape art-crying-1-shape"></div>
  </div>
  <div class="art-layer art-crying-2-motion-0">
    <div class="art-layer art-crying-2">
      <div class="art-layer art-crying-3">
        <div class="art-layer art-crying-4">
          <div class="art-layer art-crying-4-fill"></div>
          <div class="art-layer art-crying-4-stroke"></div>
        </div>
        <div class="art-layer art-crying-5">
          <div class="art-layer art-crying-5-fill"></div>
          <div class="art-layer art-crying-5-stroke"></div>
        </div>
      </div>
      <div class="art-layer art-crying-6">
        <div class="art-layer art-crying-6-fill"></div>
      </div>
      <div class="art-layer art-crying-7">
        <div class="art-layer art-crying-7-fill"></div>
      </div>
      <div class="art-layer art-crying-8">
        <div class="art-layer art-crying-8-fill"></div>
      </div>
      <div class="art-layer art-crying-9">
        <div class="art-layer art-crying-9-fill"></div>
      </div>
      <div class="art-layer art-crying-10-transform">
        <div class="art-layer art-crying-10">
          <div class="art-layer art-crying-11">
            <div class="art-shape art-crying-11-shape"></div>
          </div>
          <div class="art-layer art-crying-12">
            <div class="art-shape art-crying-12-shape"></div>
          </div>
          <div class="art-layer art-crying-13">
            <div class="art-layer art-crying-14-transform">
              <div class="art-layer art-crying-14">
                <div class="art-shape art-crying-14-shape"></div>
              </div>
            </div>
            <div class="art-layer art-crying-15-transform">
              <div class="art-layer art-crying-15">
                <div class="art-shape art-crying-15-shape"></div>
              </div>
            </div>
            <div class="art-layer art-crying-16-transform">
              <div class="art-layer art-crying-16">
                <div class="art-shape art-crying-16-shape"></div>
              </div>
            </div>
          </div>
          <div class="art-layer art-crying-17">
            <div class="art-layer art-crying-17-stroke"></div>
          </div>
          <div class="art-layer art-crying-18">
            <div class="art-layer art-crying-18-stroke"></div>
          </div>
          <div class="art-layer art-crying-19">
            <div class="art-shape art-crying-19-shape"></div>
          </div>
          <div class="art-layer art-crying-20">
            <div class="art-shape art-crying-20-shape"></div>
          </div>
          <div class="art-layer art-crying-21">
            <div class="art-shape art-crying-21-shape"></div>
          </div>
          <div class="art-layer art-crying-22">
            <div class="art-shape art-crying-22-shape"></div>
          </div>
          <div class="art-layer art-crying-23">
            <div class="art-shape art-crying-23-shape"></div>
          </div>
          <div class="art-layer art-crying-24">
            <div class="art-shape art-crying-24-shape"></div>
          </div>
          <div class="art-layer art-crying-25">
            <div class="art-layer art-crying-25-fill"></div>
            <div class="art-layer art-crying-25-stroke"></div>
          </div>
          <div class="art-layer art-crying-26">
            <div class="art-layer art-crying-26-stroke"></div>
          </div>
          <div class="art-layer art-crying-27">
            <div class="art-shape art-crying-27-shape"></div>
          </div>
          <div class="art-layer art-crying-28">
            <div class="art-shape art-crying-28-shape"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  beaten: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-beaten-view">
  <div class="art-layer art-beaten-1">
    <div class="art-shape art-beaten-1-shape"></div>
  </div>
  <div class="art-layer art-beaten-2-motion-0">
    <div class="art-layer art-beaten-2">
      <div class="art-layer art-beaten-3">
        <div class="art-layer art-beaten-4">
          <div class="art-layer art-beaten-4-fill"></div>
          <div class="art-layer art-beaten-4-stroke"></div>
        </div>
        <div class="art-layer art-beaten-5">
          <div class="art-layer art-beaten-5-fill"></div>
          <div class="art-layer art-beaten-5-stroke"></div>
        </div>
      </div>
      <div class="art-layer art-beaten-6">
        <div class="art-layer art-beaten-6-fill"></div>
      </div>
      <div class="art-layer art-beaten-7">
        <div class="art-layer art-beaten-7-fill"></div>
      </div>
      <div class="art-layer art-beaten-8">
        <div class="art-layer art-beaten-8-fill"></div>
      </div>
      <div class="art-layer art-beaten-9-motion-0">
        <div class="art-layer art-beaten-9">
          <div class="art-layer art-beaten-10">
            <div class="art-layer art-beaten-10-fill"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-beaten-11-transform">
        <div class="art-layer art-beaten-11-motion-0">
          <div class="art-layer art-beaten-11-motion-1">
            <div class="art-layer art-beaten-11">
              <div class="art-layer art-beaten-12">
                <div class="art-shape art-beaten-12-shape"></div>
              </div>
              <div class="art-layer art-beaten-13">
                <div class="art-shape art-beaten-13-shape"></div>
              </div>
              <div class="art-layer art-beaten-14">
                <div class="art-layer art-beaten-15-transform">
                  <div class="art-layer art-beaten-15">
                    <div class="art-shape art-beaten-15-shape"></div>
                  </div>
                </div>
                <div class="art-layer art-beaten-16-transform">
                  <div class="art-layer art-beaten-16">
                    <div class="art-shape art-beaten-16-shape"></div>
                  </div>
                </div>
                <div class="art-layer art-beaten-17-transform">
                  <div class="art-layer art-beaten-17">
                    <div class="art-shape art-beaten-17-shape"></div>
                  </div>
                </div>
                <div class="art-layer art-beaten-18-transform">
                  <div class="art-layer art-beaten-18">
                    <div class="art-shape art-beaten-18-shape"></div>
                  </div>
                </div>
                <div class="art-layer art-beaten-19-transform">
                  <div class="art-layer art-beaten-19">
                    <div class="art-shape art-beaten-19-shape"></div>
                  </div>
                </div>
              </div>
              <div class="art-layer art-beaten-20">
                <div class="art-shape art-beaten-20-shape"></div>
              </div>
              <div class="art-layer art-beaten-21">
                <div class="art-shape art-beaten-21-shape"></div>
              </div>
              <div class="art-layer art-beaten-22">
                <div class="art-layer art-beaten-23">
                  <div class="art-layer art-beaten-23-stroke"></div>
                </div>
                <div class="art-layer art-beaten-24">
                  <div class="art-layer art-beaten-24-stroke"></div>
                </div>
                <div class="art-layer art-beaten-25">
                  <div class="art-layer art-beaten-25-stroke"></div>
                </div>
                <div class="art-layer art-beaten-26">
                  <div class="art-layer art-beaten-26-stroke"></div>
                </div>
              </div>
              <div class="art-layer art-beaten-27">
                <div class="art-shape art-beaten-27-shape"></div>
              </div>
              <div class="art-layer art-beaten-28">
                <div class="art-layer art-beaten-28-fill"></div>
                <div class="art-layer art-beaten-28-stroke"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  angry: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-angry-view">
  <div class="art-layer art-angry-1">
    <div class="art-shape art-angry-1-shape"></div>
  </div>
  <div class="art-layer art-angry-2-motion-0">
    <div class="art-layer art-angry-2">
      <div class="art-layer art-angry-3">
        <div class="art-layer art-angry-4">
          <div class="art-layer art-angry-4-fill"></div>
          <div class="art-layer art-angry-4-stroke"></div>
        </div>
        <div class="art-layer art-angry-5">
          <div class="art-layer art-angry-5-fill"></div>
          <div class="art-layer art-angry-5-stroke"></div>
        </div>
      </div>
      <div class="art-layer art-angry-6">
        <div class="art-layer art-angry-6-fill"></div>
      </div>
      <div class="art-layer art-angry-7">
        <div class="art-layer art-angry-7-fill"></div>
      </div>
      <div class="art-layer art-angry-8-motion-0">
        <div class="art-layer art-angry-8">
          <div class="art-layer art-angry-9">
            <div class="art-layer art-angry-9-fill"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-angry-10-motion-0">
        <div class="art-layer art-angry-10">
          <div class="art-layer art-angry-11">
            <div class="art-layer art-angry-11-fill"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-angry-12-transform">
        <div class="art-layer art-angry-12">
          <div class="art-layer art-angry-13">
            <div class="art-shape art-angry-13-shape"></div>
          </div>
          <div class="art-layer art-angry-14">
            <div class="art-shape art-angry-14-shape"></div>
          </div>
          <div class="art-layer art-angry-15">
            <div class="art-layer art-angry-16-transform">
              <div class="art-layer art-angry-16">
                <div class="art-shape art-angry-16-shape"></div>
              </div>
            </div>
            <div class="art-layer art-angry-17-transform">
              <div class="art-layer art-angry-17">
                <div class="art-shape art-angry-17-shape"></div>
              </div>
            </div>
            <div class="art-layer art-angry-18-transform">
              <div class="art-layer art-angry-18">
                <div class="art-shape art-angry-18-shape"></div>
              </div>
            </div>
            <div class="art-layer art-angry-19-transform">
              <div class="art-layer art-angry-19">
                <div class="art-shape art-angry-19-shape"></div>
              </div>
            </div>
            <div class="art-layer art-angry-20-transform">
              <div class="art-layer art-angry-20">
                <div class="art-shape art-angry-20-shape"></div>
              </div>
            </div>
          </div>
          <div class="art-layer art-angry-21">
            <div class="art-layer art-angry-21-stroke"></div>
          </div>
          <div class="art-layer art-angry-22">
            <div class="art-layer art-angry-22-stroke"></div>
          </div>
          <div class="art-layer art-angry-23">
            <div class="art-shape art-angry-23-shape"></div>
          </div>
          <div class="art-layer art-angry-24">
            <div class="art-shape art-angry-24-shape"></div>
          </div>
          <div class="art-layer art-angry-25">
            <div class="art-shape art-angry-25-shape"></div>
          </div>
          <div class="art-layer art-angry-26">
            <div class="art-shape art-angry-26-shape"></div>
          </div>
          <div class="art-layer art-angry-27">
            <div class="art-shape art-angry-27-shape"></div>
          </div>
          <div class="art-layer art-angry-28">
            <div class="art-shape art-angry-28-shape"></div>
          </div>
          <div class="art-layer art-angry-29">
            <div class="art-layer art-angry-29-fill"></div>
            <div class="art-layer art-angry-29-stroke"></div>
          </div>
          <div class="art-layer art-angry-30">
            <div class="art-layer art-angry-30-fill"></div>
            <div class="art-layer art-angry-30-stroke"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-angry-31">
        <div class="art-layer art-angry-32">
          <div class="art-layer art-angry-32-stroke"></div>
        </div>
        <div class="art-layer art-angry-33">
          <div class="art-layer art-angry-33-stroke"></div>
        </div>
      </div>
      <div class="art-layer art-angry-34">
        <div class="art-layer art-angry-35">
          <div class="art-layer art-angry-35-stroke"></div>
        </div>
        <div class="art-layer art-angry-36">
          <div class="art-layer art-angry-36-stroke"></div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  scratching: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-scratching-view">
  <div class="art-layer art-scratching-1">
    <div class="art-shape art-scratching-1-shape"></div>
  </div>
  <div class="art-layer art-scratching-2-motion-0">
    <div class="art-layer art-scratching-2">
      <div class="art-layer art-scratching-3">
        <div class="art-layer art-scratching-4">
          <div class="art-layer art-scratching-4-fill"></div>
          <div class="art-layer art-scratching-4-stroke"></div>
        </div>
        <div class="art-layer art-scratching-5">
          <div class="art-layer art-scratching-5-fill"></div>
          <div class="art-layer art-scratching-5-stroke"></div>
        </div>
      </div>
      <div class="art-layer art-scratching-6">
        <div class="art-layer art-scratching-6-fill"></div>
      </div>
      <div class="art-layer art-scratching-7">
        <div class="art-layer art-scratching-7-fill"></div>
      </div>
      <div class="art-layer art-scratching-8">
        <div class="art-layer art-scratching-8-fill"></div>
      </div>
      <div class="art-layer art-scratching-9-motion-0">
        <div class="art-layer art-scratching-9">
          <div class="art-layer art-scratching-10">
            <div class="art-layer art-scratching-10-fill"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-scratching-11-transform">
        <div class="art-layer art-scratching-11-motion-0">
          <div class="art-layer art-scratching-11">
            <div class="art-layer art-scratching-12">
              <div class="art-shape art-scratching-12-shape"></div>
            </div>
            <div class="art-layer art-scratching-13">
              <div class="art-shape art-scratching-13-shape"></div>
            </div>
            <div class="art-layer art-scratching-14">
              <div class="art-layer art-scratching-15-transform">
                <div class="art-layer art-scratching-15">
                  <div class="art-shape art-scratching-15-shape"></div>
                </div>
              </div>
              <div class="art-layer art-scratching-16-transform">
                <div class="art-layer art-scratching-16">
                  <div class="art-shape art-scratching-16-shape"></div>
                </div>
              </div>
              <div class="art-layer art-scratching-17-transform">
                <div class="art-layer art-scratching-17">
                  <div class="art-shape art-scratching-17-shape"></div>
                </div>
              </div>
              <div class="art-layer art-scratching-18-transform">
                <div class="art-layer art-scratching-18">
                  <div class="art-shape art-scratching-18-shape"></div>
                </div>
              </div>
              <div class="art-layer art-scratching-19-transform">
                <div class="art-layer art-scratching-19">
                  <div class="art-shape art-scratching-19-shape"></div>
                </div>
              </div>
            </div>
            <div class="art-layer art-scratching-20">
              <div class="art-shape art-scratching-20-shape"></div>
            </div>
            <div class="art-layer art-scratching-21">
              <div class="art-shape art-scratching-21-shape"></div>
            </div>
            <div class="art-layer art-scratching-22">
              <div class="art-shape art-scratching-22-shape"></div>
            </div>
            <div class="art-layer art-scratching-23">
              <div class="art-shape art-scratching-23-shape"></div>
            </div>
            <div class="art-layer art-scratching-24">
              <div class="art-shape art-scratching-24-shape"></div>
            </div>
            <div class="art-layer art-scratching-25">
              <div class="art-shape art-scratching-25-shape"></div>
            </div>
            <div class="art-layer art-scratching-26">
              <div class="art-layer art-scratching-26-fill"></div>
              <div class="art-layer art-scratching-26-stroke"></div>
            </div>
            <div class="art-layer art-scratching-27">
              <div class="art-layer art-scratching-28">
                <div class="art-layer art-scratching-29-transform">
                  <div class="art-layer art-scratching-29">
                    <div class="art-layer art-scratching-29-stroke"></div>
                  </div>
                </div>
                <div class="art-layer art-scratching-30-transform">
                  <div class="art-layer art-scratching-30">
                    <div class="art-layer art-scratching-30-stroke"></div>
                  </div>
                </div>
                <div class="art-layer art-scratching-31-transform">
                  <div class="art-layer art-scratching-31">
                    <div class="art-layer art-scratching-31-stroke"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  waving: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-waving-view">
  <div class="art-layer art-waving-1">
    <div class="art-shape art-waving-1-shape"></div>
  </div>
  <div class="art-layer art-waving-2">
    <div class="art-layer art-waving-3">
      <div class="art-layer art-waving-3-fill"></div>
      <div class="art-layer art-waving-3-stroke"></div>
    </div>
    <div class="art-layer art-waving-4">
      <div class="art-layer art-waving-4-fill"></div>
      <div class="art-layer art-waving-4-stroke"></div>
    </div>
  </div>
  <div class="art-layer art-waving-5-motion-0">
    <div class="art-layer art-waving-5">
      <div class="art-layer art-waving-5-fill"></div>
    </div>
  </div>
  <div class="art-layer art-waving-6-transform">
    <div class="art-layer art-waving-6">
      <div class="art-layer art-waving-7">
        <div class="art-shape art-waving-7-shape"></div>
      </div>
      <div class="art-layer art-waving-8">
        <div class="art-layer art-waving-9">
          <div class="art-shape art-waving-9-shape"></div>
        </div>
        <div class="art-layer art-waving-10">
          <div class="art-layer art-waving-11-transform">
            <div class="art-layer art-waving-11">
              <div class="art-shape art-waving-11-shape"></div>
            </div>
          </div>
          <div class="art-layer art-waving-12-transform">
            <div class="art-layer art-waving-12">
              <div class="art-shape art-waving-12-shape"></div>
            </div>
          </div>
          <div class="art-layer art-waving-13-transform">
            <div class="art-layer art-waving-13">
              <div class="art-shape art-waving-13-shape"></div>
            </div>
          </div>
          <div class="art-layer art-waving-14-transform">
            <div class="art-layer art-waving-14">
              <div class="art-shape art-waving-14-shape"></div>
            </div>
          </div>
          <div class="art-layer art-waving-15-transform">
            <div class="art-layer art-waving-15">
              <div class="art-shape art-waving-15-shape"></div>
            </div>
          </div>
        </div>
        <div class="art-layer art-waving-16">
          <div class="art-shape art-waving-16-shape"></div>
        </div>
        <div class="art-layer art-waving-17">
          <div class="art-shape art-waving-17-shape"></div>
        </div>
        <div class="art-layer art-waving-18">
          <div class="art-shape art-waving-18-shape"></div>
        </div>
        <div class="art-layer art-waving-19">
          <div class="art-shape art-waving-19-shape"></div>
        </div>
        <div class="art-layer art-waving-20">
          <div class="art-layer art-waving-20-fill"></div>
          <div class="art-layer art-waving-20-stroke"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="art-layer art-waving-21">
    <div class="art-layer art-waving-21-fill"></div>
  </div>
  <div class="art-layer art-waving-22">
    <div class="art-layer art-waving-22-fill"></div>
  </div>
  <div class="art-layer art-waving-23-motion-0">
    <div class="art-layer art-waving-23">
      <div class="art-layer art-waving-24">
        <div class="art-layer art-waving-24-fill"></div>
      </div>
    </div>
  </div>
</div>`,
  },
  shy: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-shy-view">
  <div class="art-layer art-shy-1">
    <div class="art-shape art-shy-1-shape"></div>
  </div>
  <div class="art-layer art-shy-2">
    <div class="art-layer art-shy-3">
      <div class="art-layer art-shy-3-fill"></div>
      <div class="art-layer art-shy-3-stroke"></div>
    </div>
    <div class="art-layer art-shy-4">
      <div class="art-layer art-shy-4-fill"></div>
      <div class="art-layer art-shy-4-stroke"></div>
    </div>
  </div>
  <div class="art-layer art-shy-5">
    <div class="art-layer art-shy-5-fill"></div>
  </div>
  <div class="art-layer art-shy-6">
    <div class="art-layer art-shy-6-fill"></div>
  </div>
  <div class="art-layer art-shy-7-motion-0">
    <div class="art-layer art-shy-7">
      <div class="art-layer art-shy-8">
        <div class="art-layer art-shy-8-fill"></div>
      </div>
    </div>
  </div>
  <div class="art-layer art-shy-9-motion-0">
    <div class="art-layer art-shy-9">
      <div class="art-layer art-shy-10">
        <div class="art-layer art-shy-10-fill"></div>
      </div>
    </div>
  </div>
  <div class="art-layer art-shy-11-transform">
    <div class="art-layer art-shy-11-motion-0">
      <div class="art-layer art-shy-11">
        <div class="art-layer art-shy-12">
          <div class="art-shape art-shy-12-shape"></div>
        </div>
        <div class="art-layer art-shy-13">
          <div class="art-shape art-shy-13-shape"></div>
        </div>
        <div class="art-layer art-shy-14">
          <div class="art-layer art-shy-15-transform">
            <div class="art-layer art-shy-15">
              <div class="art-shape art-shy-15-shape"></div>
            </div>
          </div>
          <div class="art-layer art-shy-16-transform">
            <div class="art-layer art-shy-16">
              <div class="art-shape art-shy-16-shape"></div>
            </div>
          </div>
          <div class="art-layer art-shy-17-transform">
            <div class="art-layer art-shy-17">
              <div class="art-shape art-shy-17-shape"></div>
            </div>
          </div>
          <div class="art-layer art-shy-18-transform">
            <div class="art-layer art-shy-18">
              <div class="art-shape art-shy-18-shape"></div>
            </div>
          </div>
          <div class="art-layer art-shy-19-transform">
            <div class="art-layer art-shy-19">
              <div class="art-shape art-shy-19-shape"></div>
            </div>
          </div>
        </div>
        <div class="art-layer art-shy-20">
          <div class="art-shape art-shy-20-shape"></div>
        </div>
        <div class="art-layer art-shy-21">
          <div class="art-shape art-shy-21-shape"></div>
        </div>
        <div class="art-layer art-shy-22">
          <div class="art-shape art-shy-22-shape"></div>
        </div>
        <div class="art-layer art-shy-23">
          <div class="art-shape art-shy-23-shape"></div>
        </div>
        <div class="art-layer art-shy-24">
          <div class="art-shape art-shy-24-shape"></div>
        </div>
        <div class="art-layer art-shy-25">
          <div class="art-shape art-shy-25-shape"></div>
        </div>
        <div class="art-layer art-shy-26">
          <div class="art-layer art-shy-26-fill"></div>
          <div class="art-layer art-shy-26-stroke"></div>
        </div>
        <div class="art-layer art-shy-27">
          <div class="art-layer art-shy-27-stroke"></div>
        </div>
        <div class="art-layer art-shy-28">
          <div class="art-layer art-shy-28-stroke"></div>
        </div>
        <div class="art-layer art-shy-29">
          <div class="art-layer art-shy-29-stroke"></div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  peeking: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-peeking-view">
  <div class="art-layer art-peeking-1">
    <div class="art-shape art-peeking-1-shape"></div>
  </div>
  <div class="art-layer art-peeking-2">
    <div class="art-layer art-peeking-3">
      <div class="art-layer art-peeking-3-fill"></div>
      <div class="art-layer art-peeking-3-stroke"></div>
    </div>
    <div class="art-layer art-peeking-4">
      <div class="art-layer art-peeking-4-fill"></div>
      <div class="art-layer art-peeking-4-stroke"></div>
    </div>
  </div>
  <div class="art-layer art-peeking-5">
    <div class="art-layer art-peeking-5-fill"></div>
  </div>
  <div class="art-layer art-peeking-6-transform">
    <div class="art-layer art-peeking-6">
      <div class="art-layer art-peeking-7">
        <div class="art-shape art-peeking-7-shape"></div>
      </div>
      <div class="art-layer art-peeking-8">
        <div class="art-shape art-peeking-8-shape"></div>
      </div>
      <div class="art-layer art-peeking-9">
        <div class="art-layer art-peeking-10-transform">
          <div class="art-layer art-peeking-10">
            <div class="art-shape art-peeking-10-shape"></div>
          </div>
        </div>
        <div class="art-layer art-peeking-11-transform">
          <div class="art-layer art-peeking-11">
            <div class="art-shape art-peeking-11-shape"></div>
          </div>
        </div>
        <div class="art-layer art-peeking-12-transform">
          <div class="art-layer art-peeking-12">
            <div class="art-shape art-peeking-12-shape"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-peeking-13">
        <div class="art-shape art-peeking-13-shape"></div>
      </div>
      <div class="art-layer art-peeking-14">
        <div class="art-shape art-peeking-14-shape"></div>
      </div>
      <div class="art-layer art-peeking-15">
        <div class="art-shape art-peeking-15-shape"></div>
      </div>
      <div class="art-layer art-peeking-16">
        <div class="art-shape art-peeking-16-shape"></div>
      </div>
      <div class="art-layer art-peeking-17">
        <div class="art-layer art-peeking-17-fill"></div>
        <div class="art-layer art-peeking-17-stroke"></div>
      </div>
    </div>
  </div>
  <div class="art-layer art-peeking-18">
    <div class="art-layer art-peeking-18-fill"></div>
  </div>
  <div class="art-layer art-peeking-19">
    <div class="art-layer art-peeking-19-fill"></div>
  </div>
  <div class="art-layer art-peeking-20">
    <div class="art-layer art-peeking-20-fill"></div>
  </div>
</div>`,
  },
  laughing: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-laughing-view">
  <div class="art-layer art-laughing-1">
    <div class="art-shape art-laughing-1-shape"></div>
  </div>
  <div class="art-layer art-laughing-2-motion-0">
    <div class="art-layer art-laughing-2">
      <div class="art-layer art-laughing-3">
        <div class="art-layer art-laughing-4">
          <div class="art-layer art-laughing-4-fill"></div>
          <div class="art-layer art-laughing-4-stroke"></div>
        </div>
        <div class="art-layer art-laughing-5">
          <div class="art-layer art-laughing-5-fill"></div>
          <div class="art-layer art-laughing-5-stroke"></div>
        </div>
      </div>
      <div class="art-layer art-laughing-6">
        <div class="art-layer art-laughing-6-fill"></div>
      </div>
      <div class="art-layer art-laughing-7">
        <div class="art-layer art-laughing-7-fill"></div>
      </div>
      <div class="art-layer art-laughing-8-motion-0">
        <div class="art-layer art-laughing-8">
          <div class="art-layer art-laughing-9">
            <div class="art-layer art-laughing-9-fill"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-laughing-10-motion-0">
        <div class="art-layer art-laughing-10">
          <div class="art-layer art-laughing-11">
            <div class="art-layer art-laughing-11-fill"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-laughing-12-transform">
        <div class="art-layer art-laughing-12-motion-0">
          <div class="art-layer art-laughing-12">
            <div class="art-layer art-laughing-13">
              <div class="art-shape art-laughing-13-shape"></div>
            </div>
            <div class="art-layer art-laughing-14">
              <div class="art-shape art-laughing-14-shape"></div>
            </div>
            <div class="art-layer art-laughing-15">
              <div class="art-layer art-laughing-16-transform">
                <div class="art-layer art-laughing-16">
                  <div class="art-shape art-laughing-16-shape"></div>
                </div>
              </div>
              <div class="art-layer art-laughing-17-transform">
                <div class="art-layer art-laughing-17">
                  <div class="art-shape art-laughing-17-shape"></div>
                </div>
              </div>
              <div class="art-layer art-laughing-18-transform">
                <div class="art-layer art-laughing-18">
                  <div class="art-shape art-laughing-18-shape"></div>
                </div>
              </div>
              <div class="art-layer art-laughing-19-transform">
                <div class="art-layer art-laughing-19">
                  <div class="art-shape art-laughing-19-shape"></div>
                </div>
              </div>
              <div class="art-layer art-laughing-20-transform">
                <div class="art-layer art-laughing-20">
                  <div class="art-shape art-laughing-20-shape"></div>
                </div>
              </div>
            </div>
            <div class="art-layer art-laughing-21">
              <div class="art-layer art-laughing-21-fill"></div>
              <div class="art-layer art-laughing-21-stroke"></div>
            </div>
            <div class="art-layer art-laughing-22">
              <div class="art-layer art-laughing-22-fill"></div>
              <div class="art-layer art-laughing-22-stroke"></div>
            </div>
            <div class="art-layer art-laughing-23">
              <div class="art-layer art-laughing-23-fill"></div>
              <div class="art-layer art-laughing-23-stroke"></div>
            </div>
            <div class="art-layer art-laughing-24">
              <div class="art-layer art-laughing-24-fill"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  thinking: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-thinking-view">
  <div class="art-layer art-thinking-1">
    <div class="art-shape art-thinking-1-shape"></div>
  </div>
  <div class="art-layer art-thinking-2">
    <div class="art-layer art-thinking-3">
      <div class="art-layer art-thinking-3-fill"></div>
      <div class="art-layer art-thinking-3-stroke"></div>
    </div>
    <div class="art-layer art-thinking-4">
      <div class="art-layer art-thinking-4-fill"></div>
      <div class="art-layer art-thinking-4-stroke"></div>
    </div>
  </div>
  <div class="art-layer art-thinking-5">
    <div class="art-layer art-thinking-5-fill"></div>
  </div>
  <div class="art-layer art-thinking-6">
    <div class="art-layer art-thinking-6-fill"></div>
  </div>
  <div class="art-layer art-thinking-7-motion-0">
    <div class="art-layer art-thinking-7">
      <div class="art-layer art-thinking-8">
        <div class="art-layer art-thinking-8-fill"></div>
      </div>
    </div>
  </div>
  <div class="art-layer art-thinking-9-motion-0">
    <div class="art-layer art-thinking-9">
      <div class="art-layer art-thinking-10">
        <div class="art-layer art-thinking-10-fill"></div>
      </div>
    </div>
  </div>
  <div class="art-layer art-thinking-11-transform">
    <div class="art-layer art-thinking-11-motion-0">
      <div class="art-layer art-thinking-11">
        <div class="art-layer art-thinking-12">
          <div class="art-shape art-thinking-12-shape"></div>
        </div>
        <div class="art-layer art-thinking-13">
          <div class="art-shape art-thinking-13-shape"></div>
        </div>
        <div class="art-layer art-thinking-14">
          <div class="art-layer art-thinking-15-transform">
            <div class="art-layer art-thinking-15">
              <div class="art-shape art-thinking-15-shape"></div>
            </div>
          </div>
          <div class="art-layer art-thinking-16-transform">
            <div class="art-layer art-thinking-16">
              <div class="art-shape art-thinking-16-shape"></div>
            </div>
          </div>
          <div class="art-layer art-thinking-17-transform">
            <div class="art-layer art-thinking-17">
              <div class="art-shape art-thinking-17-shape"></div>
            </div>
          </div>
          <div class="art-layer art-thinking-18-transform">
            <div class="art-layer art-thinking-18">
              <div class="art-shape art-thinking-18-shape"></div>
            </div>
          </div>
          <div class="art-layer art-thinking-19-transform">
            <div class="art-layer art-thinking-19">
              <div class="art-shape art-thinking-19-shape"></div>
            </div>
          </div>
        </div>
        <div class="art-layer art-thinking-20">
          <div class="art-layer art-thinking-20-fill"></div>
        </div>
        <div class="art-layer art-thinking-21">
          <div class="art-shape art-thinking-21-shape"></div>
        </div>
        <div class="art-layer art-thinking-22">
          <div class="art-layer art-thinking-22-fill"></div>
        </div>
        <div class="art-layer art-thinking-23">
          <div class="art-shape art-thinking-23-shape"></div>
        </div>
        <div class="art-layer art-thinking-24">
          <div class="art-shape art-thinking-24-shape"></div>
        </div>
        <div class="art-layer art-thinking-25">
          <div class="art-shape art-thinking-25-shape"></div>
        </div>
        <div class="art-layer art-thinking-26">
          <div class="art-layer art-thinking-26-fill"></div>
          <div class="art-layer art-thinking-26-stroke"></div>
        </div>
        <div class="art-layer art-thinking-27">
          <div class="art-layer art-thinking-27-fill"></div>
          <div class="art-layer art-thinking-27-stroke"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="art-layer art-thinking-28-motion-0">
    <div class="art-layer art-thinking-28">
      <div class="art-layer art-thinking-29">
        <div class="art-layer art-thinking-29-fill"></div>
      </div>
    </div>
  </div>
  <div class="art-layer art-thinking-30-motion-0">
    <div class="art-layer art-thinking-30">
      <div class="art-layer art-thinking-31">
        <div class="art-layer art-thinking-31-fill"></div>
      </div>
    </div>
  </div>
  <div class="art-layer art-thinking-32-motion-0">
    <div class="art-layer art-thinking-32">
      <div class="art-layer art-thinking-33">
        <div class="art-layer art-thinking-33-fill"></div>
      </div>
    </div>
  </div>
</div>`,
  },
  eating: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-eating-view">
  <div class="art-layer art-eating-1">
    <div class="art-shape art-eating-1-shape"></div>
  </div>
  <div class="art-layer art-eating-2">
    <div class="art-layer art-eating-3">
      <div class="art-layer art-eating-4">
        <div class="art-layer art-eating-4-fill"></div>
        <div class="art-layer art-eating-4-stroke"></div>
      </div>
      <div class="art-layer art-eating-5">
        <div class="art-layer art-eating-5-fill"></div>
        <div class="art-layer art-eating-5-stroke"></div>
      </div>
    </div>
    <div class="art-layer art-eating-6">
      <div class="art-layer art-eating-6-fill"></div>
    </div>
    <div class="art-layer art-eating-7">
      <div class="art-layer art-eating-7-fill"></div>
    </div>
    <div class="art-layer art-eating-8">
      <div class="art-layer art-eating-8-fill"></div>
    </div>
    <div class="art-layer art-eating-9-motion-0">
      <div class="art-layer art-eating-9">
        <div class="art-layer art-eating-10">
          <div class="art-layer art-eating-10-fill"></div>
        </div>
      </div>
    </div>
    <div class="art-layer art-eating-11">
      <div class="art-shape art-eating-11-shape"></div>
    </div>
    <div class="art-layer art-eating-12-transform">
      <div class="art-layer art-eating-12">
        <div class="art-layer art-eating-13-motion-0">
          <div class="art-layer art-eating-13">
            <div class="art-layer art-eating-14">
              <div class="art-shape art-eating-14-shape"></div>
            </div>
            <div class="art-layer art-eating-15">
              <div class="art-layer art-eating-16-transform">
                <div class="art-layer art-eating-16">
                  <div class="art-shape art-eating-16-shape"></div>
                </div>
              </div>
              <div class="art-layer art-eating-17-transform">
                <div class="art-layer art-eating-17">
                  <div class="art-shape art-eating-17-shape"></div>
                </div>
              </div>
              <div class="art-layer art-eating-18-transform">
                <div class="art-layer art-eating-18">
                  <div class="art-shape art-eating-18-shape"></div>
                </div>
              </div>
              <div class="art-layer art-eating-19-transform">
                <div class="art-layer art-eating-19">
                  <div class="art-shape art-eating-19-shape"></div>
                </div>
              </div>
              <div class="art-layer art-eating-20-transform">
                <div class="art-layer art-eating-20">
                  <div class="art-shape art-eating-20-shape"></div>
                </div>
              </div>
            </div>
            <div class="art-layer art-eating-21">
              <div class="art-layer art-eating-21-fill"></div>
              <div class="art-layer art-eating-21-stroke"></div>
            </div>
            <div class="art-layer art-eating-22">
              <div class="art-layer art-eating-22-fill"></div>
              <div class="art-layer art-eating-22-stroke"></div>
            </div>
            <div class="art-layer art-eating-23">
              <div class="art-shape art-eating-23-shape"></div>
            </div>
            <div class="art-layer art-eating-24">
              <div class="art-shape art-eating-24-shape"></div>
            </div>
            <div class="art-layer art-eating-25">
              <div class="art-layer art-eating-25-fill"></div>
              <div class="art-layer art-eating-25-stroke"></div>
            </div>
            <div class="art-layer art-eating-26-motion-0">
              <div class="art-layer art-eating-26">
                <div class="art-layer art-eating-27">
                  <div class="art-layer art-eating-27-fill"></div>
                  <div class="art-layer art-eating-27-stroke"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="art-layer art-eating-28-transform">
      <div class="art-layer art-eating-28">
        <div class="art-layer art-eating-29-motion-0">
          <div class="art-layer art-eating-29">
            <div class="art-layer art-eating-30">
              <div class="art-layer art-eating-31">
                <div class="art-shape art-eating-31-shape"></div>
              </div>
              <div class="art-layer art-eating-32">
                <div class="art-shape art-eating-32-shape"></div>
              </div>
              <div class="art-layer art-eating-33">
                <div class="art-layer art-eating-33-fill"></div>
                <div class="art-layer art-eating-33-stroke"></div>
              </div>
              <div class="art-layer art-eating-34">
                <div class="art-layer art-eating-34-fill"></div>
                <div class="art-layer art-eating-34-stroke"></div>
              </div>
              <div class="art-layer art-eating-35">
                <div class="art-layer art-eating-35-fill"></div>
                <div class="art-layer art-eating-35-stroke"></div>
              </div>
              <div class="art-layer art-eating-36">
                <div class="art-layer art-eating-36-stroke"></div>
              </div>
              <div class="art-layer art-eating-37">
                <div class="art-layer art-eating-37-stroke"></div>
              </div>
              <div class="art-layer art-eating-38">
                <div class="art-layer art-eating-38-stroke"></div>
              </div>
              <div class="art-layer art-eating-39">
                <div class="art-shape art-eating-39-shape"></div>
              </div>
              <div class="art-layer art-eating-40">
                <div class="art-shape art-eating-40-shape"></div>
              </div>
              <div class="art-layer art-eating-41">
                <div class="art-shape art-eating-41-shape"></div>
              </div>
              <div class="art-layer art-eating-42">
                <div class="art-layer art-eating-42-stroke"></div>
              </div>
              <div class="art-layer art-eating-43">
                <div class="art-shape art-eating-43-shape"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  full: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-full-view">
  <div class="art-layer art-full-1">
    <div class="art-shape art-full-1-shape"></div>
  </div>
  <div class="art-layer art-full-2-motion-0">
    <div class="art-layer art-full-2">
      <div class="art-layer art-full-3">
        <div class="art-layer art-full-4">
          <div class="art-layer art-full-4-fill"></div>
          <div class="art-layer art-full-4-stroke"></div>
        </div>
        <div class="art-layer art-full-5">
          <div class="art-layer art-full-5-fill"></div>
          <div class="art-layer art-full-5-stroke"></div>
        </div>
      </div>
      <div class="art-layer art-full-6">
        <div class="art-layer art-full-6-fill"></div>
      </div>
      <div class="art-layer art-full-7-motion-0">
        <div class="art-layer art-full-7-motion-1">
          <div class="art-layer art-full-7">
            <div class="art-layer art-full-8">
              <div class="art-layer art-full-8-fill"></div>
            </div>
            <div class="art-layer art-full-9">
              <div class="art-shape art-full-9-shape"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="art-layer art-full-10-motion-0">
        <div class="art-layer art-full-10">
          <div class="art-layer art-full-11-motion-0">
            <div class="art-layer art-full-11">
              <div class="art-layer art-full-12">
                <div class="art-layer art-full-12-fill"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="art-layer art-full-13-motion-0">
        <div class="art-layer art-full-13">
          <div class="art-layer art-full-14-motion-0">
            <div class="art-layer art-full-14">
              <div class="art-layer art-full-15">
                <div class="art-layer art-full-15-fill"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="art-layer art-full-16">
        <div class="art-shape art-full-16-shape"></div>
      </div>
      <div class="art-layer art-full-17-motion-0">
        <div class="art-layer art-full-17">
          <div class="art-layer art-full-18">
            <div class="art-shape art-full-18-shape"></div>
          </div>
          <div class="art-layer art-full-19">
            <div class="art-layer art-full-20-transform">
              <div class="art-layer art-full-20">
                <div class="art-shape art-full-20-shape"></div>
              </div>
            </div>
            <div class="art-layer art-full-21-transform">
              <div class="art-layer art-full-21">
                <div class="art-shape art-full-21-shape"></div>
              </div>
            </div>
            <div class="art-layer art-full-22-transform">
              <div class="art-layer art-full-22">
                <div class="art-shape art-full-22-shape"></div>
              </div>
            </div>
            <div class="art-layer art-full-23-transform">
              <div class="art-layer art-full-23">
                <div class="art-shape art-full-23-shape"></div>
              </div>
            </div>
            <div class="art-layer art-full-24-transform">
              <div class="art-layer art-full-24">
                <div class="art-shape art-full-24-shape"></div>
              </div>
            </div>
          </div>
          <div class="art-layer art-full-25">
            <div class="art-layer art-full-26">
              <div class="art-layer art-full-26-stroke"></div>
            </div>
            <div class="art-layer art-full-27">
              <div class="art-layer art-full-27-stroke"></div>
            </div>
          </div>
          <div class="art-layer art-full-28">
            <div class="art-layer art-full-28-fill"></div>
            <div class="art-layer art-full-28-stroke"></div>
          </div>
          <div class="art-layer art-full-29">
            <div class="art-layer art-full-29-stroke"></div>
          </div>
          <div class="art-layer art-full-30">
            <div class="art-layer art-full-31">
              <div class="art-shape art-full-31-shape"></div>
            </div>
            <div class="art-layer art-full-32">
              <div class="art-shape art-full-32-shape"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="art-layer art-full-33-transform">
        <div class="art-layer art-full-33">
          <div class="art-layer art-full-34">
            <div class="art-layer art-full-35">
              <div class="art-layer art-full-35-stroke"></div>
            </div>
            <div class="art-layer art-full-36">
              <div class="art-layer art-full-36-stroke"></div>
            </div>
            <div class="art-layer art-full-37">
              <div class="art-layer art-full-37-stroke"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  fishing: {
    width: 360.0,
    height: 360.0,
    html: `<div class="art-layer art-fishing-view">
  <div class="art-layer art-fishing-1-transform">
    <div class="art-layer art-fishing-1">
      <div class="art-layer art-fishing-2-transform">
        <div class="art-layer art-fishing-2">
          <div class="art-layer art-fishing-3">
            <div class="art-shape art-fishing-3-shape"></div>
          </div>
          <div class="art-layer art-fishing-4">
            <div class="art-shape art-fishing-4-shape"></div>
          </div>
          <div class="art-layer art-fishing-5">
            <div class="art-shape art-fishing-5-shape"></div>
          </div>
          <div class="art-layer art-fishing-6">
            <div class="art-shape art-fishing-6-shape"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-fishing-7-transform">
        <div class="art-layer art-fishing-7">
          <div class="art-layer art-fishing-8-transform">
            <div class="art-layer art-fishing-8">
              <div class="art-layer art-fishing-8-fill"></div>
            </div>
          </div>
          <div class="art-layer art-fishing-9-transform">
            <div class="art-layer art-fishing-9-motion-0">
              <div class="art-layer art-fishing-9">
                <div class="art-layer art-fishing-9-fill"></div>
              </div>
            </div>
          </div>
          <div class="art-layer art-fishing-10-clip">
            <div class="art-layer art-fishing-10">
              <div class="art-layer art-fishing-10-fill"></div>
            </div>
          </div>
          <div class="art-layer art-fishing-11-clip">
            <div class="art-layer art-fishing-11">
              <div class="art-layer art-fishing-11-fill"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="art-layer art-fishing-12-transform">
        <div class="art-layer art-fishing-12">
          <div class="art-layer art-fishing-13-transform">
            <div class="art-layer art-fishing-13">
              <div class="art-layer art-fishing-14-clip">
                <div class="art-layer art-fishing-14">
                  <div class="art-layer art-fishing-14-fill"></div>
                </div>
              </div>
              <div class="art-layer art-fishing-15-clip">
                <div class="art-layer art-fishing-15">
                  <div class="art-layer art-fishing-15-fill"></div>
                </div>
              </div>
              <div class="art-layer art-fishing-16-clip">
                <div class="art-layer art-fishing-16">
                  <div class="art-layer art-fishing-16-fill"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="art-layer art-fishing-17">
        <div class="art-layer art-fishing-18">
          <div class="art-shape art-fishing-18-shape"></div>
        </div>
      </div>
      <div class="art-layer art-fishing-19-transform">
        <div class="art-layer art-fishing-19-motion-0">
          <div class="art-layer art-fishing-19">
            <div class="art-layer art-fishing-20">
              <div class="art-layer art-fishing-20-fill"></div>
            </div>
            <div class="art-layer art-fishing-21">
              <div class="art-layer art-fishing-21-stroke"></div>
            </div>
            <div class="art-layer art-fishing-22">
              <div class="art-layer art-fishing-22-stroke"></div>
            </div>
            <div class="art-layer art-fishing-23">
              <div class="art-layer art-fishing-23-stroke"></div>
            </div>
            <div class="art-layer art-fishing-24-transform">
              <div class="art-layer art-fishing-24">
                <div class="art-shape art-fishing-24-shape"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="art-layer art-fishing-25">
        <div class="art-layer art-fishing-25-fill"></div>
      </div>
    </div>
  </div>
</div>`,
  },
  turningBack: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-turningBack-view">
  <div class="art-layer art-turningBack-1">
    <div class="art-shape art-turningBack-1-shape"></div>
  </div>
  <div class="art-layer art-turningBack-2">
    <div class="art-layer art-turningBack-3">
      <div class="art-layer art-turningBack-3-fill"></div>
      <div class="art-layer art-turningBack-3-stroke"></div>
    </div>
    <div class="art-layer art-turningBack-4">
      <div class="art-layer art-turningBack-4-fill"></div>
      <div class="art-layer art-turningBack-4-stroke"></div>
    </div>
  </div>
  <div class="art-layer art-turningBack-5">
    <div class="art-layer art-turningBack-5-fill"></div>
  </div>
  <div class="art-layer art-turningBack-6">
    <div class="art-layer art-turningBack-6-fill"></div>
  </div>
  <div class="art-layer art-turningBack-7">
    <div class="art-layer art-turningBack-7-fill"></div>
  </div>
  <div class="art-layer art-turningBack-8">
    <div class="art-layer art-turningBack-8-stroke"></div>
  </div>
  <div class="art-layer art-turningBack-9">
    <div class="art-layer art-turningBack-9-stroke"></div>
  </div>
  <div class="art-layer art-turningBack-10">
    <div class="art-shape art-turningBack-10-shape"></div>
  </div>
  <div class="art-layer art-turningBack-11">
    <div class="art-layer art-turningBack-12-transform">
      <div class="art-layer art-turningBack-12">
        <div class="art-shape art-turningBack-12-shape"></div>
      </div>
    </div>
    <div class="art-layer art-turningBack-13-transform">
      <div class="art-layer art-turningBack-13">
        <div class="art-shape art-turningBack-13-shape"></div>
      </div>
    </div>
    <div class="art-layer art-turningBack-14-transform">
      <div class="art-layer art-turningBack-14">
        <div class="art-shape art-turningBack-14-shape"></div>
      </div>
    </div>
    <div class="art-layer art-turningBack-15-transform">
      <div class="art-layer art-turningBack-15">
        <div class="art-shape art-turningBack-15-shape"></div>
      </div>
    </div>
    <div class="art-layer art-turningBack-16-transform">
      <div class="art-layer art-turningBack-16">
        <div class="art-shape art-turningBack-16-shape"></div>
      </div>
    </div>
  </div>
</div>`,
  },
  umbrella: {
    width: 100.0,
    height: 100.0,
    html: `<div class="art-layer art-umbrella-view">
  <div class="art-layer art-umbrella-1">
    <div class="art-layer art-umbrella-1-fill"></div>
  </div>
  <div class="art-layer art-umbrella-2">
    <div class="art-layer art-umbrella-2-fill"></div>
  </div>
  <div class="art-layer art-umbrella-3">
    <div class="art-layer art-umbrella-3-fill"></div>
  </div>
  <div class="art-layer art-umbrella-4">
    <div class="art-layer art-umbrella-4-fill"></div>
  </div>
  <div class="art-layer art-umbrella-5">
    <div class="art-layer art-umbrella-5-stroke"></div>
  </div>
  <div class="art-layer art-umbrella-6">
    <div class="art-layer art-umbrella-6-stroke"></div>
  </div>
  <div class="art-layer art-umbrella-7">
    <div class="art-layer art-umbrella-7-stroke"></div>
  </div>
  <div class="art-layer art-umbrella-8">
    <div class="art-layer art-umbrella-8-stroke"></div>
  </div>
  <div class="art-layer art-umbrella-9">
    <div class="art-layer art-umbrella-9-stroke"></div>
  </div>
  <div class="art-layer art-umbrella-10">
    <div class="art-layer art-umbrella-10-stroke"></div>
  </div>
  <div class="art-layer art-umbrella-11">
    <div class="art-layer art-umbrella-11-stroke"></div>
  </div>
  <div class="art-layer art-umbrella-12">
    <div class="art-shape art-umbrella-12-shape"></div>
  </div>
  <div class="art-layer art-umbrella-13">
    <div class="art-shape art-umbrella-13-shape"></div>
  </div>
</div>`,
  },
  caveirinha: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-caveirinha-view">
  <div class="art-layer art-caveirinha-1">
    <div class="art-shape art-caveirinha-1-shape"></div>
  </div>
  <div class="art-layer art-caveirinha-2">
    <div class="art-layer art-caveirinha-3">
      <div class="art-layer art-caveirinha-3-fill"></div>
      <div class="art-layer art-caveirinha-3-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-4">
      <div class="art-layer art-caveirinha-4-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-5">
      <div class="art-layer art-caveirinha-5-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-6">
      <div class="art-layer art-caveirinha-6-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-7">
      <div class="art-layer art-caveirinha-7-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-8">
      <div class="art-layer art-caveirinha-8-fill"></div>
      <div class="art-layer art-caveirinha-8-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-9">
      <div class="art-layer art-caveirinha-9-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-10">
      <div class="art-layer art-caveirinha-10-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-11">
      <div class="art-layer art-caveirinha-11-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-12">
      <div class="art-layer art-caveirinha-12-stroke"></div>
    </div>
  </div>
  <div class="art-layer art-caveirinha-13">
    <div class="art-layer art-caveirinha-13-fill"></div>
  </div>
  <div class="art-layer art-caveirinha-14">
    <div class="art-layer art-caveirinha-14-fill"></div>
  </div>
  <div class="art-layer art-caveirinha-15">
    <div class="art-layer art-caveirinha-16">
      <div class="art-layer art-caveirinha-16-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-17">
      <div class="art-layer art-caveirinha-17-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-18">
      <div class="art-layer art-caveirinha-18-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-19">
      <div class="art-layer art-caveirinha-19-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-20">
      <div class="art-layer art-caveirinha-20-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-21">
      <div class="art-layer art-caveirinha-21-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-22">
      <div class="art-layer art-caveirinha-22-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-23">
      <div class="art-layer art-caveirinha-23-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-24">
      <div class="art-layer art-caveirinha-24-stroke"></div>
    </div>
    <div class="art-layer art-caveirinha-25">
      <div class="art-layer art-caveirinha-25-stroke"></div>
    </div>
  </div>
  <div class="art-layer art-caveirinha-26-transform">
    <div class="art-layer art-caveirinha-26">
      <div class="art-layer art-caveirinha-27">
        <div class="art-shape art-caveirinha-27-shape"></div>
      </div>
      <div class="art-layer art-caveirinha-28">
        <div class="art-shape art-caveirinha-28-shape"></div>
      </div>
      <div class="art-layer art-caveirinha-29">
        <div class="art-layer art-caveirinha-29-stroke"></div>
      </div>
      <div class="art-layer art-caveirinha-30">
        <div class="art-layer art-caveirinha-30-stroke"></div>
      </div>
      <div class="art-layer art-caveirinha-31">
        <div class="art-layer art-caveirinha-31-stroke"></div>
      </div>
      <div class="art-layer art-caveirinha-32">
        <div class="art-layer art-caveirinha-33-transform">
          <div class="art-layer art-caveirinha-33">
            <div class="art-shape art-caveirinha-33-shape"></div>
          </div>
        </div>
        <div class="art-layer art-caveirinha-34-transform">
          <div class="art-layer art-caveirinha-34">
            <div class="art-shape art-caveirinha-34-shape"></div>
          </div>
        </div>
        <div class="art-layer art-caveirinha-35-transform">
          <div class="art-layer art-caveirinha-35">
            <div class="art-shape art-caveirinha-35-shape"></div>
          </div>
        </div>
        <div class="art-layer art-caveirinha-36-transform">
          <div class="art-layer art-caveirinha-36">
            <div class="art-shape art-caveirinha-36-shape"></div>
          </div>
        </div>
        <div class="art-layer art-caveirinha-37-transform">
          <div class="art-layer art-caveirinha-37">
            <div class="art-shape art-caveirinha-37-shape"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-caveirinha-38">
        <div class="art-shape art-caveirinha-38-shape"></div>
      </div>
      <div class="art-layer art-caveirinha-39">
        <div class="art-shape art-caveirinha-39-shape"></div>
      </div>
      <div class="art-layer art-caveirinha-40">
        <div class="art-shape art-caveirinha-40-shape"></div>
      </div>
      <div class="art-layer art-caveirinha-41">
        <div class="art-shape art-caveirinha-41-shape"></div>
      </div>
      <div class="art-layer art-caveirinha-42">
        <div class="art-shape art-caveirinha-42-shape"></div>
      </div>
      <div class="art-layer art-caveirinha-43">
        <div class="art-shape art-caveirinha-43-shape"></div>
      </div>
      <div class="art-layer art-caveirinha-44">
        <div class="art-layer art-caveirinha-44-fill"></div>
      </div>
      <div class="art-layer art-caveirinha-45">
        <div class="art-layer art-caveirinha-45-fill"></div>
        <div class="art-layer art-caveirinha-45-stroke"></div>
      </div>
      <div class="art-layer art-caveirinha-46">
        <div class="art-layer art-caveirinha-47">
          <div class="art-shape art-caveirinha-47-shape"></div>
        </div>
        <div class="art-layer art-caveirinha-48">
          <div class="art-shape art-caveirinha-48-shape"></div>
        </div>
        <div class="art-layer art-caveirinha-49">
          <div class="art-shape art-caveirinha-49-shape"></div>
        </div>
        <div class="art-layer art-caveirinha-50">
          <div class="art-shape art-caveirinha-50-shape"></div>
        </div>
      </div>
      <div class="art-layer art-caveirinha-51">
        <div class="art-layer art-caveirinha-51-fill"></div>
        <div class="art-layer art-caveirinha-51-stroke"></div>
      </div>
      <div class="art-layer art-caveirinha-52">
        <div class="art-layer art-caveirinha-53">
          <div class="art-shape art-caveirinha-53-shape"></div>
        </div>
        <div class="art-layer art-caveirinha-54">
          <div class="art-shape art-caveirinha-54-shape"></div>
        </div>
        <div class="art-layer art-caveirinha-55">
          <div class="art-shape art-caveirinha-55-shape"></div>
        </div>
        <div class="art-layer art-caveirinha-56">
          <div class="art-shape art-caveirinha-56-shape"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="art-layer art-caveirinha-57">
    <div class="art-layer art-caveirinha-58">
      <div class="art-layer art-caveirinha-58-fill"></div>
      <div class="art-layer art-caveirinha-58-stroke"></div>
    </div>
  </div>
  <div class="art-layer art-caveirinha-59">
    <div class="art-shape art-caveirinha-59-shape"></div>
  </div>
  <div class="art-layer art-caveirinha-60">
    <div class="art-shape art-caveirinha-60-shape"></div>
  </div>
  <div class="art-layer art-caveirinha-61">
    <div class="art-layer art-caveirinha-61-stroke"></div>
  </div>
  <div class="art-layer art-caveirinha-62">
    <div class="art-layer art-caveirinha-63">
      <div class="art-layer art-caveirinha-63-fill"></div>
      <div class="art-layer art-caveirinha-63-stroke"></div>
    </div>
  </div>
  <div class="art-layer art-caveirinha-64">
    <div class="art-shape art-caveirinha-64-shape"></div>
  </div>
  <div class="art-layer art-caveirinha-65">
    <div class="art-shape art-caveirinha-65-shape"></div>
  </div>
  <div class="art-layer art-caveirinha-66">
    <div class="art-layer art-caveirinha-66-stroke"></div>
  </div>
</div>`,
  },
  deadLying: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-deadLying-view">
  <div class="art-layer art-deadLying-1">
    <div class="art-shape art-deadLying-1-shape"></div>
  </div>
  <div class="art-layer art-deadLying-2-transform">
    <div class="art-layer art-deadLying-2">
      <div class="art-layer art-deadLying-3">
        <div class="art-layer art-deadLying-4">
          <div class="art-layer art-deadLying-4-fill"></div>
          <div class="art-layer art-deadLying-4-stroke"></div>
        </div>
        <div class="art-layer art-deadLying-5">
          <div class="art-layer art-deadLying-5-fill"></div>
          <div class="art-layer art-deadLying-5-stroke"></div>
        </div>
      </div>
      <div class="art-layer art-deadLying-6-transform">
        <div class="art-layer art-deadLying-6">
          <div class="art-layer art-deadLying-7">
            <div class="art-layer art-deadLying-7-fill"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-deadLying-8-transform">
        <div class="art-layer art-deadLying-8">
          <div class="art-layer art-deadLying-9">
            <div class="art-layer art-deadLying-9-fill"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-deadLying-10">
        <div class="art-shape art-deadLying-10-shape"></div>
      </div>
      <div class="art-layer art-deadLying-11">
        <div class="art-shape art-deadLying-11-shape"></div>
      </div>
      <div class="art-layer art-deadLying-12-transform">
        <div class="art-layer art-deadLying-12">
          <div class="art-layer art-deadLying-13">
            <div class="art-shape art-deadLying-13-shape"></div>
          </div>
          <div class="art-layer art-deadLying-14">
            <div class="art-layer art-deadLying-15">
              <div class="art-layer art-deadLying-15-stroke"></div>
            </div>
            <div class="art-layer art-deadLying-16">
              <div class="art-layer art-deadLying-16-stroke"></div>
            </div>
            <div class="art-layer art-deadLying-17">
              <div class="art-layer art-deadLying-17-stroke"></div>
            </div>
            <div class="art-layer art-deadLying-18">
              <div class="art-layer art-deadLying-18-stroke"></div>
            </div>
          </div>
          <div class="art-layer art-deadLying-19">
            <div class="art-shape art-deadLying-19-shape"></div>
          </div>
          <div class="art-layer art-deadLying-20">
            <div class="art-layer art-deadLying-20-fill"></div>
            <div class="art-layer art-deadLying-20-stroke"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="art-layer art-deadLying-21">
    <div class="art-layer art-deadLying-22">
      <div class="art-shape art-deadLying-22-shape"></div>
    </div>
    <div class="art-layer art-deadLying-23">
      <div class="art-shape art-deadLying-23-shape"></div>
    </div>
    <div class="art-layer art-deadLying-24">
      <div class="art-shape art-deadLying-24-shape"></div>
    </div>
  </div>
</div>`,
  },
  trace: {
    width: 475.0,
    height: 525.0,
    html: `<div class="art-layer art-trace-view">
  <div class="art-layer art-trace-1">
    <div class="art-layer art-trace-1-fill"></div>
  </div>
  <div class="art-layer art-trace-2">
    <div class="art-layer art-trace-2-fill"></div>
  </div>
  <div class="art-layer art-trace-3">
    <div class="art-layer art-trace-3-fill"></div>
  </div>
</div>`,
  },
  snowman: {
    width: 200.0,
    height: 250.0,
    html: `<div class="art-layer art-snowman-view">
  <div class="art-layer art-snowman-1">
    <div class="art-shape art-snowman-1-shape"></div>
  </div>
  <div class="art-layer art-snowman-2">
    <div class="art-shape art-snowman-2-shape"></div>
  </div>
  <div class="art-layer art-snowman-3">
    <div class="art-shape art-snowman-3-shape"></div>
  </div>
  <div class="art-layer art-snowman-4">
    <div class="art-layer art-snowman-4-fill"></div>
  </div>
  <div class="art-layer art-snowman-5-transform">
    <div class="art-layer art-snowman-5">
      <div class="art-shape art-snowman-5-shape"></div>
    </div>
  </div>
  <div class="art-layer art-snowman-6">
    <div class="art-shape art-snowman-6-shape"></div>
  </div>
  <div class="art-layer art-snowman-7">
    <div class="art-shape art-snowman-7-shape"></div>
  </div>
  <div class="art-layer art-snowman-8">
    <div class="art-shape art-snowman-8-shape"></div>
  </div>
  <div class="art-layer art-snowman-9">
    <div class="art-shape art-snowman-9-shape"></div>
  </div>
  <div class="art-layer art-snowman-10">
    <div class="art-layer art-snowman-10-fill"></div>
    <div class="art-layer art-snowman-10-stroke"></div>
  </div>
  <div class="art-layer art-snowman-11">
    <div class="art-shape art-snowman-11-shape"></div>
  </div>
  <div class="art-layer art-snowman-12">
    <div class="art-shape art-snowman-12-shape"></div>
  </div>
  <div class="art-layer art-snowman-13">
    <div class="art-shape art-snowman-13-shape"></div>
  </div>
  <div class="art-layer art-snowman-14">
    <div class="art-layer art-snowman-15">
      <div class="art-layer art-snowman-15-stroke"></div>
    </div>
    <div class="art-layer art-snowman-16">
      <div class="art-layer art-snowman-16-stroke"></div>
    </div>
    <div class="art-layer art-snowman-17">
      <div class="art-layer art-snowman-17-stroke"></div>
    </div>
    <div class="art-layer art-snowman-18">
      <div class="art-layer art-snowman-18-stroke"></div>
    </div>
  </div>
  <div class="art-layer art-snowman-19">
    <div class="art-shape art-snowman-19-shape"></div>
  </div>
  <div class="art-layer art-snowman-20">
    <div class="art-shape art-snowman-20-shape"></div>
  </div>
  <div class="art-layer art-snowman-21">
    <div class="art-shape art-snowman-21-shape"></div>
  </div>
</div>`,
  },
  cruzeiro: {
    width: 300.0,
    height: 300.0,
    html: `<div class="art-layer art-cruzeiro-view">
  <div class="art-layer art-cruzeiro-1">
    <div class="art-layer art-cruzeiro-2">
      <div class="art-layer art-cruzeiro-2-fill"></div>
      <div class="art-layer art-cruzeiro-2-stroke"></div>
    </div>
    <div class="art-layer art-cruzeiro-3">
      <div class="art-layer art-cruzeiro-3-fill"></div>
      <div class="art-layer art-cruzeiro-3-stroke"></div>
    </div>
  </div>
  <div class="art-layer art-cruzeiro-4-motion-0">
    <div class="art-layer art-cruzeiro-4">
      <div class="art-layer art-cruzeiro-4-fill"></div>
    </div>
  </div>
  <div class="art-layer art-cruzeiro-5-transform">
    <div class="art-layer art-cruzeiro-5">
      <div class="art-layer art-cruzeiro-6">
        <div class="art-shape art-cruzeiro-6-shape"></div>
      </div>
      <div class="art-layer art-cruzeiro-7">
        <div class="art-shape art-cruzeiro-7-shape"></div>
      </div>
      <div class="art-layer art-cruzeiro-8">
        <div class="art-shape art-cruzeiro-8-shape"></div>
      </div>
      <div class="art-layer art-cruzeiro-9">
        <div class="art-shape art-cruzeiro-9-shape"></div>
      </div>
      <div class="art-layer art-cruzeiro-10">
        <div class="art-shape art-cruzeiro-10-shape"></div>
      </div>
      <div class="art-layer art-cruzeiro-11">
        <div class="art-shape art-cruzeiro-11-shape"></div>
      </div>
      <div class="art-layer art-cruzeiro-12">
        <div class="art-layer art-cruzeiro-12-fill"></div>
        <div class="art-layer art-cruzeiro-12-stroke"></div>
      </div>
    </div>
  </div>
  <div class="art-layer art-cruzeiro-13">
    <div class="art-layer art-cruzeiro-13-fill"></div>
  </div>
  <div class="art-layer art-cruzeiro-14">
    <div class="art-layer art-cruzeiro-14-fill"></div>
  </div>
  <div class="art-layer art-cruzeiro-15-transform">
    <div class="art-layer art-cruzeiro-15">
      <div class="art-layer art-cruzeiro-16-transform">
        <div class="art-layer art-cruzeiro-16">
          <div class="art-shape art-cruzeiro-16-shape"></div>
        </div>
      </div>
      <div class="art-layer art-cruzeiro-17-transform">
        <div class="art-layer art-cruzeiro-17">
          <div class="art-shape art-cruzeiro-17-shape"></div>
        </div>
      </div>
      <div class="art-layer art-cruzeiro-18-transform">
        <div class="art-layer art-cruzeiro-18">
          <div class="art-shape art-cruzeiro-18-shape"></div>
        </div>
      </div>
      <div class="art-layer art-cruzeiro-19-transform">
        <div class="art-layer art-cruzeiro-19">
          <div class="art-shape art-cruzeiro-19-shape"></div>
        </div>
      </div>
      <div class="art-layer art-cruzeiro-20-transform">
        <div class="art-layer art-cruzeiro-20">
          <div class="art-shape art-cruzeiro-20-shape"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="art-layer art-cruzeiro-21-motion-0">
    <div class="art-layer art-cruzeiro-21">
      <div class="art-layer art-cruzeiro-22">
        <div class="art-layer art-cruzeiro-22-fill"></div>
      </div>
      <div class="art-layer art-cruzeiro-23">
        <div class="art-shape art-cruzeiro-23-shape"></div>
      </div>
      <div class="art-layer art-cruzeiro-24">
        <div class="art-shape art-cruzeiro-24-shape"></div>
      </div>
      <div class="art-layer art-cruzeiro-25-transform">
        <div class="art-layer art-cruzeiro-25">
          <div class="art-layer art-cruzeiro-26">
            <div class="art-layer art-cruzeiro-26-fill"></div>
          </div>
          <div class="art-layer art-cruzeiro-27-motion-0">
            <div class="art-layer art-cruzeiro-27">
              <div class="art-layer art-cruzeiro-28">
                <div class="art-shape art-cruzeiro-28-shape"></div>
              </div>
              <div class="art-layer art-cruzeiro-29">
                <div class="art-layer art-cruzeiro-30">
                  <div class="art-layer art-cruzeiro-30-fill"></div>
                </div>
                <div class="art-layer art-cruzeiro-31-transform">
                  <div class="art-layer art-cruzeiro-31">
                    <div class="art-layer art-cruzeiro-31-fill"></div>
                  </div>
                </div>
                <div class="art-layer art-cruzeiro-32-transform">
                  <div class="art-layer art-cruzeiro-32">
                    <div class="art-layer art-cruzeiro-32-fill"></div>
                  </div>
                </div>
                <div class="art-layer art-cruzeiro-33-transform">
                  <div class="art-layer art-cruzeiro-33">
                    <div class="art-layer art-cruzeiro-33-fill"></div>
                  </div>
                </div>
                <div class="art-layer art-cruzeiro-34-transform">
                  <div class="art-layer art-cruzeiro-34">
                    <div class="art-layer art-cruzeiro-34-fill"></div>
                  </div>
                </div>
              </div>
              <div class="art-layer art-cruzeiro-35">
                <div class="art-shape art-cruzeiro-35-shape"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  pondering: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-pondering-view">
  <div class="art-layer art-pondering-1">
    <div class="art-shape art-pondering-1-shape"></div>
  </div>
  <div class="art-layer art-pondering-2">
    <div class="art-layer art-pondering-3">
      <div class="art-layer art-pondering-3-fill"></div>
      <div class="art-layer art-pondering-3-stroke"></div>
    </div>
    <div class="art-layer art-pondering-4">
      <div class="art-layer art-pondering-4-fill"></div>
      <div class="art-layer art-pondering-4-stroke"></div>
    </div>
  </div>
  <div class="art-layer art-pondering-5">
    <div class="art-layer art-pondering-5-fill"></div>
  </div>
  <div class="art-layer art-pondering-6">
    <div class="art-layer art-pondering-6-fill"></div>
  </div>
  <div class="art-layer art-pondering-7">
    <div class="art-layer art-pondering-7-fill"></div>
  </div>
  <div class="art-layer art-pondering-8-motion-0">
    <div class="art-layer art-pondering-8">
      <div class="art-layer art-pondering-9">
        <div class="art-layer art-pondering-9-fill"></div>
      </div>
    </div>
  </div>
  <div class="art-layer art-pondering-10-transform">
    <div class="art-layer art-pondering-10-motion-0">
      <div class="art-layer art-pondering-10">
        <div class="art-layer art-pondering-11">
          <div class="art-shape art-pondering-11-shape"></div>
        </div>
        <div class="art-layer art-pondering-12">
          <div class="art-shape art-pondering-12-shape"></div>
        </div>
        <div class="art-layer art-pondering-13">
          <div class="art-layer art-pondering-14-transform">
            <div class="art-layer art-pondering-14">
              <div class="art-shape art-pondering-14-shape"></div>
            </div>
          </div>
          <div class="art-layer art-pondering-15-transform">
            <div class="art-layer art-pondering-15">
              <div class="art-shape art-pondering-15-shape"></div>
            </div>
          </div>
          <div class="art-layer art-pondering-16-transform">
            <div class="art-layer art-pondering-16">
              <div class="art-shape art-pondering-16-shape"></div>
            </div>
          </div>
          <div class="art-layer art-pondering-17-transform">
            <div class="art-layer art-pondering-17">
              <div class="art-shape art-pondering-17-shape"></div>
            </div>
          </div>
          <div class="art-layer art-pondering-18-transform">
            <div class="art-layer art-pondering-18">
              <div class="art-shape art-pondering-18-shape"></div>
            </div>
          </div>
        </div>
        <div class="art-layer art-pondering-19">
          <div class="art-shape art-pondering-19-shape"></div>
        </div>
        <div class="art-layer art-pondering-20">
          <div class="art-shape art-pondering-20-shape"></div>
        </div>
        <div class="art-layer art-pondering-21">
          <div class="art-shape art-pondering-21-shape"></div>
        </div>
        <div class="art-layer art-pondering-22">
          <div class="art-shape art-pondering-22-shape"></div>
        </div>
        <div class="art-layer art-pondering-23">
          <div class="art-layer art-pondering-23-fill"></div>
          <div class="art-layer art-pondering-23-stroke"></div>
        </div>
        <div class="art-layer art-pondering-24">
          <div class="art-shape art-pondering-24-shape"></div>
        </div>
        <div class="art-layer art-pondering-25">
          <div class="art-shape art-pondering-25-shape"></div>
        </div>
        <div class="art-layer art-pondering-26">
          <div class="art-shape art-pondering-26-shape"></div>
        </div>
        <div class="art-layer art-pondering-27">
          <span class="art-text">...</span>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  happyJump: {
    width: 260.0,
    height: 260.0,
    html: `<div class="art-layer art-happyJump-view">
  <div class="art-layer art-happyJump-1">
    <div class="art-shape art-happyJump-1-shape"></div>
  </div>
  <div class="art-layer art-happyJump-2-motion-0">
    <div class="art-layer art-happyJump-2">
      <div class="art-layer art-happyJump-3">
        <div class="art-layer art-happyJump-4">
          <div class="art-layer art-happyJump-4-fill"></div>
          <div class="art-layer art-happyJump-4-stroke"></div>
        </div>
        <div class="art-layer art-happyJump-5">
          <div class="art-layer art-happyJump-5-fill"></div>
          <div class="art-layer art-happyJump-5-stroke"></div>
        </div>
      </div>
      <div class="art-layer art-happyJump-6">
        <div class="art-layer art-happyJump-6-fill"></div>
      </div>
      <div class="art-layer art-happyJump-7">
        <div class="art-layer art-happyJump-7-fill"></div>
      </div>
      <div class="art-layer art-happyJump-8-transform">
        <div class="art-layer art-happyJump-8">
          <div class="art-layer art-happyJump-9">
            <div class="art-shape art-happyJump-9-shape"></div>
          </div>
          <div class="art-layer art-happyJump-10">
            <div class="art-layer art-happyJump-11">
              <div class="art-shape art-happyJump-11-shape"></div>
            </div>
            <div class="art-layer art-happyJump-12">
              <div class="art-layer art-happyJump-13-transform">
                <div class="art-layer art-happyJump-13">
                  <div class="art-shape art-happyJump-13-shape"></div>
                </div>
              </div>
              <div class="art-layer art-happyJump-14-transform">
                <div class="art-layer art-happyJump-14">
                  <div class="art-shape art-happyJump-14-shape"></div>
                </div>
              </div>
              <div class="art-layer art-happyJump-15-transform">
                <div class="art-layer art-happyJump-15">
                  <div class="art-shape art-happyJump-15-shape"></div>
                </div>
              </div>
            </div>
            <div class="art-layer art-happyJump-16">
              <div class="art-shape art-happyJump-16-shape"></div>
            </div>
            <div class="art-layer art-happyJump-17">
              <div class="art-shape art-happyJump-17-shape"></div>
            </div>
            <div class="art-layer art-happyJump-18">
              <div class="art-shape art-happyJump-18-shape"></div>
            </div>
            <div class="art-layer art-happyJump-19">
              <div class="art-shape art-happyJump-19-shape"></div>
            </div>
            <div class="art-layer art-happyJump-20">
              <div class="art-layer art-happyJump-20-fill"></div>
              <div class="art-layer art-happyJump-20-stroke"></div>
            </div>
            <div class="art-layer art-happyJump-21">
              <div class="art-layer art-happyJump-21-fill"></div>
              <div class="art-layer art-happyJump-21-stroke"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="art-layer art-happyJump-22-motion-0">
        <div class="art-layer art-happyJump-22">
          <div class="art-layer art-happyJump-23">
            <div class="art-layer art-happyJump-23-fill"></div>
          </div>
        </div>
      </div>
      <div class="art-layer art-happyJump-24-motion-0">
        <div class="art-layer art-happyJump-24">
          <div class="art-layer art-happyJump-25">
            <div class="art-layer art-happyJump-25-fill"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
};
