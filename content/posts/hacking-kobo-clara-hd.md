---
title: "Hacking my Kobo Clara HD in 204"
date: 2024-03-31
author: "Robby"
tags: ["ereader", "kobo", "hacking", "reading", "offline"]
draft: false
---

This post is an extension of the great tutorial ["Hacking my Kobo Clara HD"](https://anarc.at/hardware/tablet/kobo-clara-hd), with the some extra details and clarifications from my experience.

## 1. Installing KOReader

  This thread has the installation information: [link](https://www.mobileread.com/forums/showthread.php?t=314220).

  1. Search for "One-Click Kobo Packages", and download the desired package zip (I just did KOReader and Plato)
  2. Search for your OS ("Windows", "macOS", or "Linux") and download the "install script archive" and unzip it in the same folder as the package zip.
  3. Run `./install.sh`; follow any prompts
  4. Safely eject the device, reboot, and profit!

## 2. Configuring SSH

  1. Plug in your device via USB and mount it (probably done automatically)
  2. Copy in your public RSA (non-RSA might not work, but did not confirm) SSH key into:

  ```sh
  <Full Path to Reader>/KOBOeReader/.adds/koreader/settings/SSH/authorized_keys`. For reference:
  ```

  For reference:

  ```sh
# My full path on Linux looks like:
  /run/media/horv/KOBOeReader/.adds/koreader/settings/SSH/authorized_keys
# My copy command looks like:
  cp ~/.ssh/id_rsa.pub /run/media/horv/KOBOeReader/.adds/koreader/settings/SSH/authorized_keys
  ```
    

  3. Safely eject the device
  4. SSH into device following [KOReader docs](Connect to the e-reader via SSH)

  - Transferring files via SSH:

  ```sh
  scp -P 2222 <Local File Path> root@<Your Kobo IP>:<Destination Path on Kobo>`
  ```

## 3. Installing Syncthing 

  1. Install latest ARM binary (32-bit for Kobo Clara HD)
  2. SSH into device (see step 2)
  3. Make Syncthing config directory: `mkdir -p ~/.config/syncthing`
  4. Add config:

  ```sh
  echo '<configuration version="18">
      <gui enabled="true" tls="false" debugging="false">
          <address>0.0.0.0:8384</address>
      </gui>
  </configuration>' > ~/.config/syncthing/config.xml
  ```

  5. Copy a valid certificate authority (`ca-certificates.crt`) to device from your own. For me it was:

  ```sh
  scp -P 2222 /etc/ssl/certs/ca-certificates.crt root@<Your Kobo IP>:/etc/ssl/certs/
  ```

  6. Run `syncthing` over SSH:

  /mnt/onboard/.adds/syncthing

  7. Open `syncthing` via a browser by going to:
    - [`http://<Your Kobo IP>:8384/`](http://<Your Kobo IP>:8384/) (assuming default `syncthing` port is set)
  8. For security, add a username and password to Syncthing
  9. Search "figure out how to start it" in ["Hacking my Kobo Clara HD"](https://anarc.at/hardware/tablet/kobo-clara-hd) for several methods on how to start Syncthing on the device
