# Audioserverfront

This is the frontend for real-time automatic speech recognition using as backend the project [audioserver](https://github.com/cristiantg/audioserver).

## Installation

Requires a standard [docker](https://docs.docker.com/engine/install/ubuntu/) distribution to deploy the app.

## Deployment

```bash
cd audioserverfront
docker build --no-cache -t audioserverfront .
docker run -d -p 80:80 audioserverfront
```

## Acknowlegment

This project has been developed in collaboration with D. Figueroa Fernández.

## Citations

If you use this in your research, just cite the repo,

```bibtex
@misc{cristiantg2023audioserverfrontend,
  title={audioserver-frontend},
  author={Tejedor-Garcia, Cristian},
  journal={GitHub repository},
  year={2023},
  publisher={GitHub},
  url = {https://github.com/cristiantg/audioserverfront}
}
```

## Contact
[Cristian Tejedor-García](https://cristiantg.com) : **cristian [dot] tejedorgarcia [at] ru [dot] nl**

[Centre for Language and Speech Technology (CLST), Radboud University](https://www.ru.nl/clst/vm/contact-us/ "CLST")


## License

[Apache License 2.0](http://www.apache.org/licenses/)
