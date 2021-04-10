import "./style.css";
import { Component, createRef } from "react";
import { getPokemonImage } from "../../utils/mapper";
import { getPokemonDataFromName } from "../../api";
import PokemonType from "../../components/PokemonType";
import FavouriteButton from "../FavouriteButton";
import { pokemonTypeColors } from "../../config/constants";
import { leftFillNum } from "../../utils/number";
import AppContext from "../../context/AppContext";

class Card extends Component {
  constructor() {
    super();
    this.state = {
      pokemonData: null
    };
    this.cardRef = createRef();
  }
  static contextType = AppContext;
  loadPokemonData = (entries) => {
    const { pokemonName } = this.props;
    entries.forEach(async (entry) => {
      if (entry.isIntersecting) {
        const pokemonCacheData = this.context.loadedPokemonData[pokemonName];
        if (pokemonCacheData) {
          this.setState({ pokemonData: pokemonCacheData });
        } else {
          const pokemonData = await getPokemonDataFromName(
            this.props.pokemonName
          );
          this.context.addToLoadedPokemonData(
            this.props.pokemonName,
            pokemonData
          );
          this.setState({ pokemonData });
        }
      }
    });
  };

  toggleFavourites = () => {
    const { pokemonName } = this.props;
    this.context.toggleFavourites(pokemonName);
  };
  componentDidMount() {
    const options = {
      root: null,
      rootMargin: "200px",
      threshold: 0.3
    };

    const observer = new IntersectionObserver(this.loadPokemonData, options);
    observer.observe(this.cardRef.current);
  }
  render() {
    const { pokemonName } = this.props;
    const { pokemonData } = this.state;
    const typeColor = pokemonData
      ? pokemonTypeColors[pokemonData.types[0]?.type?.name] ||
        pokemonTypeColors.normal
      : "#000";
    const style = {
      background: `linear-gradient(180deg,rgba(255, 255, 255, 0) 0%,${typeColor} 100%)`
    };
    const isFavourite = this.context.favouritePokemons.includes(pokemonName);
    return (
      <div
        ref={this.cardRef}
        className="card grow"
        onClick={() => this.props.onClickHandler(pokemonData)}
      >
        <div className="card__overlay" style={style}>
          <img
            loading="lazy"
            className="card__image"
            src={pokemonData ? getPokemonImage(pokemonData) : ""}
            alt={""}
          />
          <h3 className="card__title">{pokemonName}</h3>
          <h4 className="card__id">
            #{pokemonData ? leftFillNum(pokemonData.id, 4) : ""}
          </h4>
        </div>
        <div className="card__content">
          <div>
            {pokemonData &&
              pokemonData.types.map((data) => (
                <PokemonType key={data.type.name} typeName={data.type.name} />
              ))}
          </div>
          <FavouriteButton
            style={{ height: "26px" }}
            isFavourite={isFavourite}
            clickHandler={this.toggleFavourites}
          />
        </div>
      </div>
    );
  }
}
export default Card;
