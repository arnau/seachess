# Docker on Ubuntu 14.04

Written by Arnau Siches on 2014-12-20.

_All tests are done using a Vagrant `ubuntu/trusty64` box_.

Ubuntu Trusty (Kernel 3.13.0-43-generic) offers `docker.io` package which
installs Docker 1.0.1. That is too far from the current version (1.4.)

To [install Docker from Docker-mantained package](https://docs.docker.com/installation/ubuntulinux)
you can `curl -sSL https://get.docker.com/ubuntu/ | sudo sh`.

After that, chances are you will get a devicemapper error when building an image.

    INFO[0041] Error getting container 0488280575a073426d93e73dbf35266c26b3b85356acfd848e1c7885ec5007f6 from driver devicemapper: Error mounting '/dev/mapper/docker-8:1-140696-0488280575a073426d93e73dbf35266c26b3b85356acfd848e1c7885ec5007f6' on '/var/lib/docker/devicemapper/mnt/0488280575a073426d93e73dbf35266c26b3b85356acfd848e1c7885ec5007f6': no such file or directory

See [Issue 4036-47707516](https://github.com/docker/docker/issues/4036#issuecomment-47707516)

Let's try to avoid the error by using AUFS instead.

    # From a brand new Ubuntu installation:
    $ sudo apt-get install linux-image-extra-`uname -r`
    $ curl -sSL https://get.docker.com/ubuntu/ | sudo sh
    $ sudo docker info
      Containers: 0
      Images: 0
      Storage Driver: aufs
        Root Dir: /var/lib/docker/aufs
        Dirs: 0
      Execution Driver: native-0.2
      Kernel Version: 3.13.0-43-generic
      Operating System: Ubuntu 14.04.1 LTS
      CPUs: 2
      Total Memory: 993.9 MiB
      Name: foo
      ID: FY3Q:5EC7:O3GX:GDXN:OVL2:CAED:R64V:LFVN:4UIV:MSRX:XNGH:EPZT
      WARNING: No swap limit support

From here you are safe to build your own images.
