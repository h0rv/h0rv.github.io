# Hacking my Kobo Clara HD in 2024
2024-03-31

This post is an extension of the great tutorial ["Hacking my Kobo Clara HD"](https://anarc.at/hardware/tablet/kobo-clara-hd), with the some extra details and clarifications from my experience.

## 1. Installing KOReader

This thread has the installation information: [link](https://www.mobileread.com/forums/showthread.php?t=314220).

* Search for "One-Click Kobo Packages", and download the desired package zip (I just did KOReader and Plato)
* Search for your OS ("Windows", "macOS", or "Linux") and download the "install script archive" and unzip it in the same folder as the package zip.
* Run `./install.sh`; follow any prompts
* Safely eject the device, reboot, and profit!

## 2. Configuring SSH

* Plug in your device via USB and mount it (probably done automatically)
* Copy in your public RSA (non-RSA might not work, but did not confirm) SSH key into:

```
<Full Path to Reader>/KOBOeReader/.adds/koreader/settings/SSH/authorized_keys
```

For reference, my full path on Linux looks like:

```
/run/media/horv/KOBOeReader/.adds/koreader/settings/SSH/authorized_keys
```

...and my copy command looks like:

```
cp ~/.ssh/id_rsa.pub /run/media/horv/KOBOeReader/.adds/koreader/settings/SSH/authorized_keys
```

* Safely eject the device

* SSH into device following \[KOReader docs]\(Connect to the e-reader via SSH)

* Transferring files via SSH:

```
scp -P 2222 <Local File Path> root@<Your Kobo IP>:<Destination Path on Kobo>`
```

## 3. Installing Syncthing

* Install latest ARM binary (32-bit for Kobo Clara HD)
* SSH into device (see step 2)
* Make Syncthing config directory: `mkdir -p ~/.config/syncthing`
* Add config:

```
echo '<configuration version="18">
    <gui enabled="true" tls="false" debugging="false">
        <address>0.0.0.0:8384</address>
    </gui>
</configuration>' > ~/.config/syncthing/config.xml
```

* Copy a valid certificate authority (`ca-certificates.crt`) to device from your own. For me it was:

```
scp -P 2222 /etc/ssl/certs/ca-certificates.crt root@<Your Kobo IP>:/etc/ssl/certs/
```

* Run `syncthing` over SSH:

```sh
/mnt/onboard/.adds/syncthing
```

* Open `syncthing` via a browser by going to:
    * `http://<Your Kobo IP>:8384/` (assuming default `syncthing` port is set)
* For security, add a username and password to Syncthing
* Search "figure out how to start it" in ["Hacking my Kobo Clara HD"](https://anarc.at/hardware/tablet/kobo-clara-hd) for several methods on how to start Syncthing on the device
