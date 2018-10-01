import { ListaNegociacoes } from '../models/ListaNegociacoes';
import { Mensagem } from '../models/Mensagem';
import { NegociacoesView } from '../views/NegociacoesView';
import { MensagemView } from '../views/MensagemView';
import { NegociacaoService } from '../services/NegociacaoService';
import { DateHelper } from '../helpers/DateHelper';
import { Bind } from '../helpers/Bind';
import { Negociacao } from '../models/Negociacao';

class NegociacaoController {

    constructor() {
        let $ = document.querySelector.bind(document);
        this._inputData = $('#data');
        this._inputQuantidade = $('#quantidade');
        this._inputValor = $('#valor');
        this._listaNegociacoes = new Bind(new ListaNegociacoes(), new NegociacoesView($('#negociacoesView')), 'adiciona', 'esvazia', 'ordena', 'inverteOrdem');
        this._mensagem = new Bind(new Mensagem(), new MensagemView($('#mensagemView')), 'texto');
        this._ordemAtual = '';
        this._negociacaoService = new NegociacaoService();
        this._init();
    }

    _init() {

        this._negociacaoService
            .lista()
            .then(negociacoes => negociacoes.forEach(negociacao => this._listaNegociacoes.adiciona(negociacao)))
            .catch(erro => this._mensagem.texto = erro);

        setInterval(() => {
            this.importaNegociacoes();
        }, 3000);
    }

    adiciona(event) {
        event.preventDefault();
        let negociacao = this._criaNegociacao();
        this._negociacaoService
            .cadastra(negociacao)
            .then((mensagem) => {
                this._listaNegociacoes.adiciona(negociacao);
                this._mensagem.texto = mensagem;
            })
            .catch(erro => this._mensagem.texto = erro);
    }

    _criaNegociacao() {
        return new Negociacao(
            DateHelper.textToDate(this._inputData.value),
            parseInt(this._inputQuantidade.value),
            parseFloat(this._inputValor.value)
        );
    }

    _limpaFormulario() {
        this._inputData.value = '';
        this._inputQuantidade.value = 1;
        this._inputValor.value = 0;
        this._inputData.focus();
    }

    apaga() {

        this._negociacaoService
            .apaga()
            .then(mensagem => {
                this._mensagem.texto = mensagem;
                this._listaNegociacoes.esvazia();
            })
            .catch(erro => this._mensagem.texto = erro);
    }

    importaNegociacoes() {
        this._negociacaoService
            .importa(this._listaNegociacoes.negociacoes)
            .then(negociacoes => negociacoes.filter(negociacao =>
                !this._listaNegociacoes.negociacoes.some(negociacaoExistente =>
                    JSON.stringify(negociacao) == JSON.stringify(negociacaoExistente)))
            )
            .then(negociacoes => {
                negociacoes.forEach(negociacao => this._listaNegociacoes.adiciona(negociacao));
                this._mensagem.texto = 'Novas negociações foram feitas';
            })
            .catch(erro => this._mensagem.texto = erro);
    }

    ordena(coluna) {
        if (this._ordemAtual == coluna) {
            this._listaNegociacoes.inverteOrdem();
        } else {
            this._listaNegociacoes.ordena((p, s) => p[coluna] - s[coluna]);
        }
        this._ordemAtual = coluna;
    }

}

let negociacaoController = new NegociacaoController();
export function currentInstance() {
    return negociacaoController;
}